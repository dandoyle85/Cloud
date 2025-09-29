export async function onRequest(context) {
  try {
    // Mock: In real build, fetch from Google Trends, Reddit, YouTube, Amazon, Udemy, Wikipedia
    const trending = ["AI tools", "Drone mapping", "Home gym hacks", "Pet calming beds"];
    const evergreen = ["Fitness apps", "Remote work tools", "Eco cleaning products", "Side hustles"];
    const niches = Array.from(new Set([...trending, ...evergreen]));
    return new Response(JSON.stringify({ source: ["google","reddit","youtube","amazon","udemy","wikipedia"], count: niches.length, niches }), {headers: {"Content-Type":"application/json"}});
  } catch (err) {
    return new Response(JSON.stringify({ count: 0, niches: ["Drones","AI","Fitness","Pets"] }), {headers: {"Content-Type":"application/json"}});
  }
}