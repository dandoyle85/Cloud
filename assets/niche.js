// niche.js

function renderNiches(data) {
  const list = document.querySelector("#nicheList");
  if (!list) return;

  list.innerHTML = "";
  data.forEach(niche => {
    const li = document.createElement("li");
    li.textContent = niche.niche || niche;
    list.appendChild(li);
  });
}

async function fetchNiches() {
  try {
    const res = await fetch("/api/niches");
    const data = await res.json();
    log("Niches:", data);
    renderNiches(data);
  } catch (err) {
    log("Error fetching niches:", err);
  }
}

async function addNiche() {
  const input = document.querySelector("#nicheInput");
  if (!input || !input.value.trim()) return;

  try {
    const res = await fetch("/api/niches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ niche: input.value.trim() })
    });
    const data = await res.json();
    log("Added niche:", data);
    input.value = "";
    fetchNiches();
  } catch (err) {
    log("Error adding niche:", err);
  }
}

async function fetchKeyword() {
  const kw = document.querySelector("#keywordInput")?.value.trim();
  if (!kw) return;

  try {
    const res = await fetch("/api/keywords/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: kw })
    });
    const data = await res.json();
    log("Keyword validated:", data);

    const output = document.querySelector("#promptOutput");
    if (output) {
      output.value = data.prompt || "⚠️ No prompt generated.";
    }
  } catch (err) {
    log("Error validating keyword:", err);
  }
}
