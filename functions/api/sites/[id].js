// Handles updating or deleting a site by ID
export async function onRequest(context) {
  const { request, params, env } = context;
  const method = request.method.toUpperCase();
  const siteId = params.id;

  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;

  const rest = (path, init = {}) =>
    fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        ...init.headers
      }
    });

  if (method === 'PATCH') {
    const body = await request.json();
    const r = await rest(`sites?id=eq.${siteId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(body)
    });
    return new Response(await r.text(), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (method === 'DELETE') {
    await rest(`sites?id=eq.${siteId}`, { method: 'DELETE' });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
