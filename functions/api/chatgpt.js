export async function onRequest(context) {
  if (!context.env?.OPENAI_KEY) {
    return new Response(JSON.stringify({
      error: "OPENAI_KEY not set",
      prompt: "Write a 1,000-word SEO blog post on 'drone mapping business' with 5 H2s and 3 affiliate callouts."
    }), { headers: { "Content-Type": "application/json" }});
  }
  return new Response(JSON.stringify({ status: "ChatGPT integration coming soon." }), {
    headers: { "Content-Type": "application/json" }
  });
}