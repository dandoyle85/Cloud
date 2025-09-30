// niche.js
function renderNiches(data) {
  const list = document.getElementById("nicheList");
  if (!list) return;
  list.innerHTML = "";
  data.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n.name || n;
    list.appendChild(li);
  });
}

async function fetchNiches() {
  try {
    const res = await fetch("/api/niches");
    const data = await res.json();
    renderNiches(data);
    log("Niches loaded", data);
  } catch (err) {
    log("Error fetching niches", err.message);
  }
}

async function addNiche() {
  const input = document.getElementById("nicheInput");
  if (!input.value.trim()) return;
  try {
    const res = await fetch("/api/niches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: input.value.trim() })
    });
    const data = await res.json();
    input.value = "";
    fetchNiches();
    log("Added niche", data);
  } catch (err) {
    log("Error adding niche", err.message);
  }
}
