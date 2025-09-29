export async function onRequest(context) {
  try {
    // Mocked live-like sources
    const googleTrends = ["AI productivity tools", "Drone mapping", "Home gym setup"];
    const reddit = ["Side hustle ideas", "Entrepreneur tips", "Remote work tools"];
    const youtube = ["Viral drone footage", "AI video editing", "Fitness hacks"];
    const amazon = ["Pet calming bed", "Eco cleaning kit", "Standing desk"];
    const evergreen = ["Fitness apps", "Eco-friendly products", "No-code builders", "Side hustles"];

    const niches = Array.from(new Set([
      ...googleTrends,
      ...reddit,
      ...youtube,
      ...amazon,
      ...evergreen
    ]));

    return new Response(
      JSON.stringify({
        source: ["google", "reddit", "youtube", "amazon", "evergreen"],
        count: niches.length,
        niches
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    // Always provide a fallback list
    return new Response(
      JSON.stringify({
        source: ["fallback"],
        niches: ["Drones", "AI tools", "Pets", "Fitness"]
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
