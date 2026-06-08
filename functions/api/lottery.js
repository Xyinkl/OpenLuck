/**
 * OpenLuck — Cloudflare Pages Function
 * Handles lottery record persistence via Cloudflare KV.
 *
 * KV binding name: OPENLUCK_KV
 * Create with: wrangler kv:namespace create OPENLUCK_KV
 * Then add the binding in wrangler.toml (see project root).
 *
 * Routes:
 *   POST /api/lottery   — save a completed lottery record
 *   GET  /api/lottery   — list all records (newest first)
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const JSON_HEADERS = { 'Content-Type': 'application/json', ...CORS };

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

  // ── GET: list all records ──────────────────────────
  if (request.method === 'GET') {
    try {
      const list = await kv.list({ prefix: 'lottery:' });
      const records = await Promise.all(
        list.keys.map(k => kv.get(k.name, { type: 'json' }))
      );
      // Filter nulls, sort newest first
      const sorted = records
        .filter(Boolean)
        .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

      return new Response(JSON.stringify(sorted), { headers: JSON_HEADERS });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: JSON_HEADERS,
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
        expirationTtl: 60 * 60 * 24 * 365 * 2,
      });

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
