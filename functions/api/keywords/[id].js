export async function onRequestPatch(context) {
  try {
    const { params, env, request } = context;
    const id = params.id;
    const body = await request.json().catch(()=>({}));

    const r = await fetch(`${env.SUPABASE_URL}/rest/v1/keywords?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(body || {})
    });
    const t = await r.text();
    return new Response(t, { headers: { 'Content-Type':'application/json' }, status: r.status });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
