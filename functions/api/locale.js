/**
 * OpenLuck — Cloudflare Pages Function
 * GET /api/locale — returns coarse country & timezone only.
 * No IP collection or storage. Used for i18n language fallback.
 *
 * Response: { country: "CN"|"US"|..., timezone: "Asia/Shanghai"|... }
 */
export async function onRequest(context) {
  const { request } = context;
  const cf = request.cf || {};
  if (!['GET','OPTIONS'].includes(request.method)) return new Response(null,{status:405,headers:{Allow:'GET, OPTIONS','Cache-Control':'no-store'}});

  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  return new Response(JSON.stringify({
    country:  cf.country  || null,
    timezone: cf.timezone || null,
  }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS },
  });
}