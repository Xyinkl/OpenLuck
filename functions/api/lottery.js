/**
 * OpenLuck — Cloudflare Pages Function
 * Handles lottery record persistence via Cloudflare KV.
 *
 * KV binding name: OPENLUCK_KV
 * Create with: wrangler kv:namespace create OPENLUCK_KV
 * Then add the binding in wrangler.toml (see project root).
 *
 * Routes:
 *   POST /api/lottery          — save a completed lottery record
 *   GET  /api/lottery          — list records (newest first) from the aggregated index
 *   GET  /api/lottery?rebuild=1 — rebuild that index from lottery:* keys (migration / repair)
 *   GET  /api/lottery?fresh=1   — skip the short edge cache (history refresh)
 *
 * Individual `lottery:*` keys stay the source of truth. `index:lotteries` is a
 * derived copy updated on write. Existing keys are never rewritten.
 * If the index is missing, the next GET rebuilds it (one-time backfill).
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  ...CORS,
};

const INDEX_KEY = 'index:lotteries';
const INDEX_VERSION = 1;
const LIST_TTL_SECONDS = 45;
const RECORD_TTL_SECONDS = 60 * 60 * 24 * 365 * 2;
const RECORD_TTL_MS = RECORD_TTL_SECONDS * 1000;

function sortRecords(records) {
  return records
    .filter(record => {
      if (!record || typeof record !== 'object' || !record.id) return false;
      const raw = record.completedAt || record.createdAt;
      if (!raw) return true;
      const ts = Date.parse(raw);
      if (!Number.isFinite(ts)) return true;
      return Date.now() - ts < RECORD_TTL_MS;
    })
    .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
}

async function loadAllRecords(kv) {
  const records = [];
  let cursor;
  do {
    const page = await kv.list({ prefix: 'lottery:', cursor, limit: 1000 });
    const values = await Promise.all(page.keys.map(key => kv.get(key.name, { type: 'json' })));
    for (const value of values) records.push(value);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return sortRecords(records);
}

async function readIndex(kv) {
  const data = await kv.get(INDEX_KEY, { type: 'json' });
  if (!data || data.v !== INDEX_VERSION || !Array.isArray(data.records)) return null;
  return sortRecords(data.records);
}

async function writeIndex(kv, records) {
  const sorted = sortRecords(records);
  await kv.put(INDEX_KEY, JSON.stringify({
    v: INDEX_VERSION,
    updatedAt: new Date().toISOString(),
    records: sorted,
  }));
  return sorted;
}

async function rebuildIndex(kv) {
  const records = await loadAllRecords(kv);
  await writeIndex(kv, records);
  return records;
}

async function upsertIndex(kv, record) {
  let records = await readIndex(kv);
  if (!records) records = await loadAllRecords(kv);
  const next = records.filter(item => item.id !== record.id);
  next.push(record);
  await writeIndex(kv, next);
}

function listCacheRequest(request) {
  const url = new URL(request.url);
  url.search = '';
  url.hash = '';
  return new Request(url.toString(), { method: 'GET' });
}

async function readCachedList(request) {
  try {
    return await caches.default.match(listCacheRequest(request));
  } catch (_) {
    return null;
  }
}

async function writeCachedList(request, response) {
  const copy = response.clone();
  try {
    await caches.default.put(listCacheRequest(request), copy);
  } catch (_) {}
}

async function invalidateListCache(request) {
  try {
    await caches.default.delete(listCacheRequest(request));
  } catch (_) {}
}

function listResponse(records, cacheable) {
  const headers = { ...JSON_HEADERS };
  if (cacheable) {
    const policy = `public, max-age=${LIST_TTL_SECONDS}, stale-while-revalidate=${LIST_TTL_SECONDS}`;
    headers['Cache-Control'] = policy;
    headers['CDN-Cache-Control'] = policy;
  } else {
    headers['Cache-Control'] = 'no-store';
  }
  return new Response(JSON.stringify(records), { headers });
}

async function respondWithList(context, records, { browserCache }) {
  const cacheable = listResponse(records, true);
  const stored = writeCachedList(context.request, cacheable);
  if (context.waitUntil) context.waitUntil(stored);
  else stored.catch(() => {});
  return browserCache ? cacheable : listResponse(records, false);
}

// Same algorithm as the frontend — re-derive winners from blockHash server-side
async function computeWinners(blockHash, total, count) {
  const enc = new TextEncoder();
  const winners = [], selected = new Set();
  let round = 0;
  while (winners.length < count) {
    const input = blockHash + round.toString(16).padStart(4, '0');
    const buf   = await crypto.subtle.digest('SHA-256', enc.encode(input));
    const hex   = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    const num   = Number(BigInt('0x' + hex.slice(0, 16)) % BigInt(total)) + 1;
    if (!selected.has(num)) { selected.add(num); winners.push(num); }
    round++;
  }
  return winners.sort((a, b) => a - b);
}

export async function onRequest(context) {
  const { request, env } = context;

  // Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const kv = env.OPENLUCK_KV;

  // ── GET: list records from the aggregated index ──
  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const rebuild = url.searchParams.get('rebuild') === '1';
      const fresh = rebuild || url.searchParams.get('fresh') === '1';
      if (!fresh) {
        const hit = await readCachedList(request);
        if (hit) return hit;
      }

      let records = rebuild ? null : await readIndex(kv);
      if (!records) records = await rebuildIndex(kv);
      return await respondWithList(context, records, { browserCache: !fresh });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...JSON_HEADERS, 'Cache-Control': 'no-store' },
      });
    }
  }

  // ── POST: save a record ────────────────────────────
  if (request.method === 'POST') {
    try {
      // Rate limiting: max 5 submissions per IP per hour
      const ip       = request.headers.get('CF-Connecting-IP') || 'unknown';
      const hourSlot = Math.floor(Date.now() / 3_600_000);
      const rlKey    = `rl:${ip}:${hourSlot}`;
      const rlCount  = Number(await kv.get(rlKey)) || 0;
      if (rlCount >= 5) {
        return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), {
          status: 429,
          headers: JSON_HEADERS,
        });
      }
      await kv.put(rlKey, String(rlCount + 1), { expirationTtl: 7200 }); // TTL 2h for cleanup

      const body = await request.json();

      // Validate required fields
      const required = ['targetBlock', 'blockHash', 'total', 'count', 'winners'];
      for (const field of required) {
        if (body[field] === undefined) {
          return new Response(JSON.stringify({ error: `Missing field: ${field}` }), {
            status: 400,
            headers: JSON_HEADERS,
          });
        }
      }

      // Sanitize & range-check
      const total = Number(body.total);
      const count = Number(body.count);
      if (!Number.isInteger(total) || total < 2 || total > 1000) {
        return new Response(JSON.stringify({ error: 'total must be 2–1000' }), { status: 400, headers: JSON_HEADERS });
      }
      if (!Number.isInteger(count) || count < 1 || count >= total || count / total > 0.8) {
        return new Response(JSON.stringify({ error: 'count out of range' }), { status: 400, headers: JSON_HEADERS });
      }
      const winners = (body.winners || []).map(Number);
      if (winners.length !== count || winners.some(w => !Number.isInteger(w) || w < 1 || w > total)) {
        return new Response(JSON.stringify({ error: 'winners invalid' }), { status: 400, headers: JSON_HEADERS });
      }

      // Validate blockHash format: optional 0x + exactly 64 hex chars
      const rawHash = String(body.blockHash).replace(/^0x/i, '');
      if (!/^[0-9a-f]{64}$/i.test(rawHash)) {
        return new Response(JSON.stringify({ error: 'blockHash invalid format' }), { status: 400, headers: JSON_HEADERS });
      }

      // Re-derive winners server-side and compare
      const computed = await computeWinners(rawHash, total, count);
      const submitted = [...winners].sort((a, b) => a - b);
      if (computed.join(',') !== submitted.join(',')) {
        return new Response(JSON.stringify({ error: 'winners do not match block hash' }), { status: 400, headers: JSON_HEADERS });
      }

      // Dedup: one record per targetBlock
      const targetBlock = Number(body.targetBlock);
      if (!Number.isInteger(targetBlock) || targetBlock < 1) {
        return new Response(JSON.stringify({ error: 'targetBlock invalid' }), { status: 400, headers: JSON_HEADERS });
      }
      const dedupKey = `dedup:${targetBlock}`;
      const exists   = await kv.get(dedupKey);
      if (exists) {
        return new Response(JSON.stringify({ error: 'This block has already been recorded' }), { status: 409, headers: JSON_HEADERS });
      }
      await kv.put(dedupKey, '1', { expirationTtl: 60 * 60 * 24 * 365 * 2 });

      const record = {
        id:          `${targetBlock}-${Date.now()}`,
        title:       String(body.title       || '未命名抽奖').slice(0, 100),
        targetBlock,
        blockHash:   '0x' + rawHash,
        total,
        count,
        winners,
        createdAt:   body.createdAt   || new Date().toISOString(),
        completedAt: body.completedAt || new Date().toISOString(),
      };

      const key = `lottery:${record.completedAt}:${record.id}`;
      await kv.put(key, JSON.stringify(record), {
        // Records expire after 2 years (optional — remove to keep forever)
        expirationTtl: RECORD_TTL_SECONDS,
      });

      // Index update is derived. A failure must not lose the record above.
      try {
        await upsertIndex(kv, record);
      } catch (_) {
        try { await kv.delete(INDEX_KEY); } catch (__) {}
      }
      await invalidateListCache(request);

      return new Response(JSON.stringify({ success: true, id: record.id }), {
        status: 201,
        headers: JSON_HEADERS,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: CORS });
}
