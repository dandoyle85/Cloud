export async function onRequestGet(context) {
  let niches = [];
  try {
    const res = await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US");
    const xml = await res.text();
    const matches = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)].map(m=>m[1]);
    niches.push(...matches.slice(1,6)); // skip first title (channel title)
  } catch (e) {
    niches.push("Google Trends fetch failed");
  }
  try {
    const rd = await fetch("https://www.reddit.com/r/Entrepreneur/hot.json?limit=5", {
      headers: { "User-Agent":"Mozilla/5.0" }
    }).then(r=>r.json());
    niches.push(...rd.data.children.map(c=>c.data.title));
  } catch (e) {
    niches.push("Reddit fetch failed");
  }
  if(niches.length===0){
    niches.push("Evergreen: Side Hustles","Evergreen: AI Tools","Evergreen: Blogging","Evergreen: Fitness Apps");
  }
  return new Response(JSON.stringify({ niches }), { headers: { "Content-Type":"application/json" } });
}