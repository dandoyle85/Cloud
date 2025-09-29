export async function onRequest(context) {
  const url = new URL(context.request.url);
  const seed = (url.searchParams.get("seed") || "drone").trim();
  const keywords = [
    { keyword: seed + " business", rank: "🔥🔥🔥🔥🔥" },
    { keyword: seed + " software", rank: "🔥🔥🔥" },
    { keyword: seed + " side hustle", rank: "🔥🔥" }
  ];
  if (!context.env?.OPENAI_KEY) {
    const prompt = `You are a keyword strategist. Given the seed "${seed}", analyze these keywords:\n- ${keywords.map(k => k.keyword).join("\n- ")}\n\nReturn ONLY valid JSON in this format:\n[ { "keyword": "...", "volume": 0, "competition": "low|medium|high", "intent": "informational|commercial|transactional", "score": "🔥🔥🔥", "titles": ["..."], "shorts": ["..."], "pins": ["..."] } ]`;
    return new Response(JSON.stringify({ mode: "manual", prompt, keywords }), {headers: {"Content-Type":"application/json"}});
  }
  return new Response(JSON.stringify({ mode: "auto", keywords }), {headers: {"Content-Type":"application/json"}});
}