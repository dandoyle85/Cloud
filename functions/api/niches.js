export async function onRequestGet(context) {
  const niches = [];
  try {
    const g = await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US")
      .then(r=>r.text());
    const matches = [...g.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)].map(m=>m[1]);
    niches.push(...matches);
  } catch {}
  try {
    const rd = await fetch("https://www.reddit.com/r/Entrepreneur/hot.json?limit=10", {
      headers: { "User-Agent":"Mozilla/5.0" }
    }).then(r=>r.json());
    niches.push(...rd.data.children.map(c=>c.data.title));
  } catch {}
  niches.push("YouTube Automation","AI Shorts Growth");
  return new Response(JSON.stringify({ niches }), { headers: { "Content-Type":"application/json" } });
}
export async function onRequestPost(context) {
  const body = await context.request.json();
  const res = await fetch(`${context.env.SUPABASE_URL}/rest/v1/niches`, {
    method:"POST",
    headers:{
      apikey: context.env.SUPABASE_SERVICE_KEY,
      Authorization:`Bearer ${context.env.SUPABASE_SERVICE_KEY}`,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({ niche_name: body.name })
  });
  return new Response(await res.text(), { headers: { "Content-Type":"application/json" } });
}