export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

  const rest = (path, init={}) =>
    fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        ...init.headers
      }
    });

  if (method === 'GET') {
    const site_id = url.searchParams.get('site_id');
    if (!site_id) return json({ error: 'site_id required' }, 400);
    const r = await rest(`keywords?site_id=eq.${site_id}&select=*`);
    return json(await r.json());
  }

  if (method === 'POST') {
    const body = await request.json();
    const { site_id, keywords } = body;
    if (!site_id || !Array.isArray(keywords)) {
      return json({ error: 'site_id and keywords[] required' }, 400);
    }
    const inserted = [];
    for (const k of keywords) {
      const ins = await rest('keywords', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ site_id, keyword: k, created_at: new Date().toISOString() })
      });
      const out = await ins.json();
      if (Array.isArray(out) && out[0]) inserted.push(out[0]);
    }
    return json({ inserted });
  }

  return json({ error: 'Method not allowed' }, 405);
}

function json(data, status=200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' }});
}
