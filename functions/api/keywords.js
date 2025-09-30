export async function onRequestPost(context) {
  try {
    const { site_id, seed } = await context.request.json();
    if (!site_id || !seed) return new Response(JSON.stringify({ error:"site_id and seed required" }), { status:400 });
    let collected = [];
    try {
      const g = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`)
        .then(r=>r.json());
      collected.push(...(g[1]||[]).map(k=>({ keyword:k, source:"google" })));
    } catch {}
    try {
      const yt = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(seed)}`)
        .then(r=>r.json());
      collected.push(...(yt[1]||[]).map(k=>({ keyword:k, source:"youtube" })));
    } catch {}
    try {
      const rd = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(seed)}&limit=5`, {
        headers:{ "User-Agent":"Mozilla/5.0" }
      }).then(r=>r.json());
      collected.push(...(rd.data.children||[]).map(c=>({ keyword:c.data.title, source:"reddit" })));
    } catch {}
    for (const kw of collected) {
      await fetch(`${context.env.SUPABASE_URL}/rest/v1/keywords`, {
        method:"POST",
        headers:{
          apikey: context.env.SUPABASE_SERVICE_KEY,
          Authorization:`Bearer ${context.env.SUPABASE_SERVICE_KEY}`,
          "Content-Type":"application/json",
          Prefer:"return=representation"
        },
        body: JSON.stringify({ site_id, keyword: kw.keyword, source: kw.source, created_at: new Date().toISOString() })
      });
    }
    return new Response(JSON.stringify({ keywords: collected }), { headers: { "Content-Type":"application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error:err.message }), { status:500 });
  }
}