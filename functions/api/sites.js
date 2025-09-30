export async function onRequestGet(context) {
  const res = await fetch(`${context.env.SUPABASE_URL}/rest/v1/sites`, {
    headers: {
      apikey: context.env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${context.env.SUPABASE_SERVICE_KEY}`
    }
  });
  return new Response(await res.text(), { headers: { "Content-Type": "application/json" } });
}