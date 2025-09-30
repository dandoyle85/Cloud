if (method === 'POST') {
  const body = await request.json();
  const { site_id, keywords, seed } = body;
  if (!site_id) return json({ error: 'site_id required' }, 400);

  let collected = [];

  // Seed mode
  if (seed) {
    const q = encodeURIComponent(seed);

    // Google autocomplete
    const g = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`).then(r=>r.json()).catch(()=>null);
    const gList = Array.isArray(g) ? g[1] : [];

    // YouTube autocomplete
    const yt = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${q}`).then(r=>r.json()).catch(()=>null);
    const ytList = Array.isArray(yt) ? yt[1] : [];

    // Reddit search
    const rd = await fetch(`https://www.reddit.com/search.json?q=${q}&sort=hot&limit=10`, { headers: { 'User-Agent': 'Mozilla/5.0' }}).then(r=>r.json()).catch(()=>null);
    const rdList = (rd?.data?.children || []).map(p => p.data?.title || "").filter(Boolean);

    collected = [...gList, ...ytList, ...rdList].map(s => String(s).trim()).filter(Boolean);
  }

  // Manual keywords
  if (Array.isArray(keywords)) {
    collected = [...collected, ...keywords];
  }

  if (!collected.length) {
    return json({ error: 'No keywords generated' }, 400);
  }

  // Insert into Supabase
  const results = [];
  for (const k of collected) {
    const ins = await rest('keywords', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ site_id, keyword: k, created_at: new Date().toISOString() })
    });
    const out = await ins.json();
    if (Array.isArray(out) && out[0]) results.push(out[0]);
  }

  return json({ inserted: results.length, keywords: results });
}
