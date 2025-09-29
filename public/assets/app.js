async function fetchNiches() {
  const res = await fetch("/api/niches");
  const data = await res.json();
  const list = document.getElementById("nicheList");
  list.innerHTML = data.niches.map(n => `<li>${n}</li>`).join("");
}

async function fetchKeywords() {
  const seed = document.getElementById("seedInput").value || "drone";
  const res = await fetch(`/api/keywords?seed=${encodeURIComponent(seed)}`);
  const data = await res.json();
  const list = document.getElementById("keywordList");
  list.innerHTML = data.keywords.map(k => `<li>${k.keyword} - ${k.rank}</li>`).join("");
  if (data.mode === "manual") {
    document.getElementById("promptBox").textContent = data.prompt;
  } else {
    document.getElementById("promptBox").textContent = "";
  }
}

async function fetchOffers() {
  const res = await fetch("/api/offers");
  const data = await res.json();
  const list = document.getElementById("offerList");
  list.innerHTML = data.offers.map(o => `<li>${o.name} (${o.network}) - ${o.commission}</li>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  fetchNiches();
  fetchOffers();
});