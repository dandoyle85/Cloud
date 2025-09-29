async function fetchNiches() {
  const res = await fetch("/api/niches");
  const data = await res.json();
  const list = document.getElementById("nicheList");
  list.innerHTML = data.niches
    .map(n => `<li><button class="nicheBtn" onclick="runNiche('${n}')">${n}</button></li>`)
    .join("");
}
async function runNiche(niche) {
  document.getElementById("seedInput").value = niche;
  await fetchKeywords();
  await fetchOffers();
}
async function fetchKeywords() {
  const seed = document.getElementById("seedInput").value || "drone";
  const res = await fetch(`/api/keywords?seed=${encodeURIComponent(seed)}`);
  const data = await res.json();
  const list = document.getElementById("keywordList");
  list.innerHTML = data.keywords.map(k => `<li>${k.keyword} - ${k.rank}</li>`).join("");
  if (data.mode === "manual") {
    document.getElementById("promptBox").value = data.prompt;
  } else {
    document.getElementById("promptBox").value = "";
  }
}
async function fetchOffers() {
  const res = await fetch("/api/offers");
  const data = await res.json();
  const list = document.getElementById("offerList");
  list.innerHTML = data.offers.map(o => `<li>${o.name} (${o.network}) - ${o.commission}</li>`).join("");
}
function copyPrompt() {
  const box = document.getElementById("promptBox");
  navigator.clipboard.writeText(box.value || box.textContent);
  alert("Prompt copied! Paste it into ChatGPT Pro.");
}
document.addEventListener("DOMContentLoaded", () => {
  fetchNiches();
  fetchOffers();
});