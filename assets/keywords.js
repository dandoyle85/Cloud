// keywords.js
async function loadSeedSuggestions() {
  try {
    const res = await fetch("/api/niches");
    const data = await res.json();
    const dropdown = document.getElementById("seedSuggestions");
    dropdown.innerHTML = `<option value="">-- Suggested Seeds --</option>` +
      data.slice(0, 10).map(n => `<option value="${n.name || n}">${n.name || n}</option>`).join("");
    log("Seed suggestions loaded");
  } catch (err) {
    log("Error loading seed suggestions", err.message);
  }
}

document.getElementById("seedSuggestions").addEventListener("change", e => {
  if (e.target.value) document.getElementById("seed").value = e.target.value;
});
document.getElementById("refreshSeedsBtn").addEventListener("click", loadSeedSuggestions);

document.getElementById("expandBtn").addEventListener("click", async () => {
  const site = document.getElementById("siteDropdown").value;
  const seed = document.getElementById("seed").value;
  if (!site || !seed) return alert("Select site and seed");

  try {
    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: site, seed })
    });
    const data = await res.json();
    log("Keywords expanded", data);
    const tbody = document.getElementById("keywordTable").querySelector("tbody");
    tbody.innerHTML = data.map(k => `<tr><td>${k.keyword}</td><td>${k.source}</td><td>${k.score}</td></tr>`).join("");
  } catch (err) {
    log("Error expanding keywords", err.message);
  }
});

document.getElementById("aiSlider").addEventListener("input", e => {
  const modes = ["Calm", "Aggressive", "Insanity"];
  document.getElementById("aiModeLabel").textContent = modes[e.target.value];
});

loadSeedSuggestions();
