export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { site_id, keywords, seed } = body;

    if (!site_id) {
      return new Response(JSON.stringify({ error: "site_id required" }), { status: 400 });
    }

    let collected = [];

    // Seed Mode expansion
    if (seed) {
      const q = encodeURIComponent(seed);

      // Google Autocomplete
      let gList = [];
      try {
        const g = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`)
          .then(r => r.json());
        if (Array.isArray(g)) gList = g[1];
      } catch (e) {}

      // YouTube Autocomplete
      let ytList = [];
      try {
        const yt = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${q}`)
          .then(r => r.json());
        if (Array.isArray(yt)) ytList = yt[1];
      } catch (e) {}

      // Reddit Hot Posts
      let rdList = [];
      try {
        const rd = await fetch(`https://www.reddit.com/search.json?q=${q}&sort=hot&limit=10`, {
          headers: { "User-Agent": "Mozilla/5.0" }
        }).then(r => r.json());
        rdList = (rd?.data?.children || []).map(p => p.data?.title || "").filter(Boolean);
      } catch (e) {}

      collected = [...gList, ...ytList, ...rdList];
    }

    // Manual keywords
    if (Array.isArray(keywords)) {
      collected = [...collected, ...keywords];
    }

    if (!collected.length) {
      return new Response(JSON.stringify({ error: "No keywords generated" }), { status: 400 });
    }

    // Save into Supabase
    const results = [];
    for (const k of collected) {
      const res = await fetch(`${context.env.SUPABASE_URL}/rest/v1/keywords`, {
        method: "POST",
        headers: {
          apikey: context.env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${context.env.SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          site_id,
          keyword: k,
          created_at: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (Array.isArray(data) && data[0]) results.push(data[0]);
    }

    return new Response(JSON.stringify({ inserted: results.length, keywords: results }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}