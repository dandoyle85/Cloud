export async function onRequest(context) {
  const niches = ["Drone business ideas","AI side hustles","Home fitness apps","Budget travel hacks",
  "Eco-friendly products","Remote work tools","Meal prep guides","Pet training tips",
  "Productivity templates","No-code app builders"];
  return new Response(JSON.stringify({ source: ["static"], count: niches.length, niches }), {
    headers: {"Content-Type":"application/json"}
  });
}