// 🔥 Seed Mode expansion
if (seed) {
  const q = encodeURIComponent(seed);
  let gList = [], ytList = [], rdList = [];

  // Google Autocomplete
  try {
    const g = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`)
      .then(r => r.json());
    gList = Array.isArray(g) ? g[1] : [];
  } catch (e) {
    console.log("Google failed:", e.message);
  }

  // YouTube Autocomplete
  try {
    const yt = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${q}`)
      .then(r => r.json());
    ytList = Array.isArray(yt) ? yt[1] : [];
  } catch (e) {
    console.log("YouTube failed:", e.message);
  }

  // Reddit Hot
  try {
    const rd = await fetch(`https://www.reddit.com/search.json?q=${q}&sort=hot&limit=10`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(r => r.json());
    rdList = (rd?.data?.children || []).map(p => p.data?.title || "").filter(Boolean);
  } catch (e) {
    console.log("Reddit failed:", e.message);
  }

  // Fallback generator
  const fallback = [
    `${seed} tips`,
    `${seed} business`,
    `${seed} software`,
    `${seed} for beginners`,
    `${seed} 2025 trends`
  ];

  collected = [...gList, ...ytList, ...rdList, ...fallback];
}
