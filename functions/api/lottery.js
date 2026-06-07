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

      // Sanitize
      const record = {
        id:          `${body.targetBlock}-${Date.now()}`,
        title:       String(body.title       || '未命名抽奖').slice(0, 100),
        targetBlock: Number(body.targetBlock),
        blockHash:   String(body.blockHash).slice(0, 66),
        total:       Number(body.total),
        count:       Number(body.count),
        winners:     (body.winners || []).map(Number),
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
