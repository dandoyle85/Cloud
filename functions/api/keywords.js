export async function onRequest(context) {
  const url = new URL(context.request.url);
  const seed = (url.searchParams.get("seed") || "drone").trim();
  const keywords = [
    { keyword: seed + " business", rank: "🔥🔥🔥🔥🔥" },
    { keyword: seed + " software", rank: "🔥🔥🔥" },
    { keyword: seed + " side hustle", rank: "🔥🔥" }
  ];
  if (!context.env?.OPENAI_KEY) {
    const prompt = `You are a keyword strategist. Given the seed "${seed}", analyze these keywords:\n- ${keywords.map(k => k.keyword).join("\n- ")}\n\nStep 1: Expand into at least 10 high-traffic, low-competition keyword ideas (long-tail style).\nStep 2: For each keyword, return ONLY valid JSON in this format:\n[ { "keyword": "...", "volume": 0, "competition": "low|medium|high", "intent": "informational|commercial|transactional", "score": "🔥🔥🔥", "titles": ["10 blog titles optimized for SEO"], "shorts": ["3 YouTube Shorts hook ideas"], "pins": ["3 Pinterest pin title ideas"] } ]\n\nDo not include explanations — only JSON.`;
    return new Response(JSON.stringify({ mode: "manual", prompt, keywords }), {headers: {"Content-Type":"application/json"}});
  }
  return new Response(JSON.stringify({ mode: "auto", keywords }), {headers: {"Content-Type":"application/json"}});
}