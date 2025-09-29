// /api/keywords
// GET  ?site_id=...                → list keywords for a site
// POST {site_id, seed}             → expand seed → score → upsert → return list
// POST {site_id, keywords:[...]}   → upsert a provided list directly

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
    const r = await rest(`keywords?site_id=eq.${site_id}&select=*&order=created_at.desc`);
    const data = await r.json();
    return json({ keywords: data });
  }

  if (method === 'POST') {
    const body = await request.json();
    const { site_id } = body || {};
    if (!site_id) return json({ error: 'site_id required' }, 400);

    // 2 POST modes:
    // A) {site_id, seed:"drone mapping"} → expand via free sources
    // B) {site_id, keywords:["k1","k2",...]} → upsert as-is
    let collected = [];

    if (body.seed) {
      const seed = String(body.seed).trim();

      // ---- Free sources (no API keys) ----
      // Google autocomplete
      const g = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`).then(r=>r.json()).catch(()=>null);
      const gList = Array.isArray(g) ? g[1] : [];

      // YouTube autocomplete
      const yt = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(seed)}`).then(r=>r.json()).catch(()=>null);
      const ytList = Array.isArray(yt) ? yt[1] : [];

      // Reddit search titles (top results)
      const rd = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(seed)}&sort=hot&limit=10`, { headers: { 'User-Agent': 'Mozilla/5.0' }}).then(r=>r.json()).catch(()=>null);
      const rdList = (rd?.data?.children || []).map(p => (p.data?.title || '')).filter(Boolean);

      const all = [...gList, ...ytList, ...rdList]
        .map(s => String(s).toLowerCase().trim())
        .filter(s => s && s.length <= 80);

      // de-dupe & keep relevant
      const uniq = Array.from(new Set(all))
        .filter(k => k.includes(seed.split(' ')[0])); // simple filter around topic root

      collected = uniq.slice(0, 30); // keep it lean
    } else if (Array.isArray(body.keywords)) {
      collected = body.keywords.map(String);
    } else {
      return json({ error: 'Provide seed or keywords[]' }, 400);
    }

    // --- Score & decorate ---
    const scored = collected.map(k => {
      const intent = inferIntent(k);
      const comp  = estimateCompetition(k);  // heuristic
      const vol   = estimateVolume(k);       // heuristic from length/terms/sources
      const score = toScore({ vol, comp, intent });

      const titles = genTitles(k);
      const shorts = genShorts(k);
      const pins   = genPins(k);

      return {
        keyword: k,
        volume: vol,
        competition: comp,
        intent,
        score,
        titles, shorts, pins
      };
    });

    // --- Upsert into Supabase ---
    // We’ll do one-by-one to keep it simple/robust for Pages Functions.
    const results = [];
    for (const row of scored) {
      const ins = await rest('keywords', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ site_id, ...row, created_at: new Date().toISOString() })
      });
      const out = await ins.json();
      if (Array.isArray(out) && out[0]) results.push(out[0]);
    }

    return json({ inserted: results.length, keywords: results });
  }

  return json({ error: 'Method not allowed' }, 405);
}

/* ---------- helpers ---------- */

function json(data, status=200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' }});
}

// very simple heuristics; later swap with real volumes (KWP/SerpAPI/etc.)
function inferIntent(k) {
  const s = k.toLowerCase();
  if (/(best|review|vs|pricing|software|services|buy|deal|discount)/.test(s)) return 'commercial';
  if (/(how to|guide|tutorial|learn|ideas|tips|examples|what is)/.test(s)) return 'informational';
  return 'transactional';
}
function estimateCompetition(k) {
  // shorter/exact terms are usually higher competition
  if (k.length < 18) return 'high';
  if (k.length < 35) return 'medium';
  return 'low';
}
function estimateVolume(k) {
  // naive: more common words + shorter = higher; cap 20k
  const base = 500 + Math.max(0, 1500 - k.length * 25);
  const bonus = /(best|review|software|2025|top)/.test(k) ? 400 : 0;
  return Math.max(50, Math.min(20000, Math.round(base + bonus)));
}
function toScore({ vol, comp, intent }) {
  let s = 0;
  s += Math.min(5, Math.floor(vol / 2000) + 1);     // 1..5
  s += (comp === 'low' ? 3 : comp === 'medium' ? 2 : 0);
  s += (intent === 'commercial' ? 2 : intent === 'informational' ? 1 : 0);
  return Math.max(0, Math.min(10, s));
}

function genTitles(k) {
  return [
    `10 ${titleCase(k)} Ideas That Work`,
    `${titleCase(k)}: Beginner’s Guide`,
    `${titleCase(k)} in 2025: What Actually Works`
  ];
}
function genShorts(k) {
  return [
    `Hook: Stop scrolling — ${k} in 30s!`,
    `3 pitfalls with ${k} (and fixes)`,
    `${k}: before/after in 10 seconds`
  ];
}
function genPins(k) {
  return [
    `${titleCase(k)} Checklist`,
    `Top Tools for ${titleCase(k)}`,
    `Beginner mistakes in ${titleCase(k)}`
  ];
}
function titleCase(s){ return s.replace(/\w\S*/g, t=>t[0].toUpperCase()+t.slice(1)); }
