// Handles listing all sites + creating a new site
export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();

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

  if (method === 'GET') {
    const r = await rest(
      'sites?select=id,site_name,url,post_status,export,scaling,active,last_auto,next_auto,created_at'
    );
    return new Response(await r.text(), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (method === 'POST') {
    const b = await request.json();
    const {
      site_name,
      url,
      wp_username,
      wp_app_password,
      post_status = 'draft',
      export_mode = 'dashboard',
      scaling = 'calm',
      active = false
    } = b;

    if (!site_name || !url || !wp_username || !wp_app_password) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const b64 = btoa(wp_app_password);
    const bytes = Array.from(new TextEncoder().encode(b64));

    const ins = await rest('sites', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        site_name,
        url,
        wp_username,
        wp_app_password_encrypted: bytes,
        post_status,
        export: export_mode,
        scaling,
        active
      })
    });

    return new Response(await ins.text(), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
