// ----- Tabs -----
document.querySelectorAll('.tabBtn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tabBtn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab==='wordpress'){ renderWpSites(); }
  });
});

// ----- Hot Niches / Dashboard -----
async function fetchNiches(){
  try{
    const res = await fetch('/api/niches');
    const data = await res.json();
    const list = document.getElementById('nicheList');
    list.innerHTML = data.niches
      .map(n => `<li><button class="nicheBtn" onclick="runNiche('${n.replace(/'/g,"\\'")}')">${n}</button></li>`)
      .join("");
    document.getElementById('lastUpdated').innerText = 'Last updated: ' + new Date().toLocaleString();
  }catch(e){ console.error(e); }
}
function addNiche(){
  const val = document.getElementById('newNicheInput').value.trim();
  if(!val) return;
  const li = document.createElement('li');
  li.innerHTML = `<button class="nicheBtn" onclick="runNiche('${val.replace(/'/g,"\\'")}')">${val}</button>`;
  document.getElementById('nicheList').appendChild(li);
  document.getElementById('newNicheInput').value = '';
}
async function runNiche(n){
  document.getElementById('seedInput').value = n;
  await fetchKeywords();
  await fetchOffers();
}
async function fetchKeywords(){
  const seed = document.getElementById('seedInput').value || 'drone';
  const res = await fetch(`/api/keywords?seed=${encodeURIComponent(seed)}`);
  const data = await res.json();
  document.getElementById('keywordList').innerHTML =
    data.keywords.map(k => `<li>${k.keyword} — <span class="badge">${k.rank}</span></li>`).join("");
  document.getElementById('promptBox').value = (data.mode === 'manual') ? data.prompt : '';
}
async function fetchOffers(){
  const res = await fetch('/api/offers');
  const data = await res.json();
  document.getElementById('offerList').innerHTML =
    data.offers.map(o => `<li>${o.name} <span class="meta">(${o.network})</span> — <span class="badge">${o.commission}</span></li>`).join("");
}
function copyPrompt(){
  const box = document.getElementById('promptBox');
  navigator.clipboard.writeText(box.value || box.textContent);
  alert('Prompt copied!');
}
document.addEventListener('DOMContentLoaded', ()=>{
  fetchNiches(); fetchOffers(); renderAutoOverview();
});

// ----- WordPress Integration (localStorage mock DB) -----
const DB_KEY = 'wpSites_v1';
const loadSites = ()=>{ try{ return JSON.parse(localStorage.getItem(DB_KEY)) || []; }catch{ return []; } }
const saveSites = (sites)=>{ localStorage.setItem(DB_KEY, JSON.stringify(sites)); renderAutoOverview(); }

function saveWpSite(){
  const site = {
    id: crypto.randomUUID(),
    name: document.getElementById('wpName').value.trim(),
    url: document.getElementById('wpUrl').value.trim(),
    user: document.getElementById('wpUser').value.trim(),
    pass: document.getElementById('wpPass').value.trim(),
    status: document.getElementById('wpStatus').value,     // draft|publish
    exportMode: document.getElementById('wpExport').value, // dashboard|manual|auto
    scaling: document.getElementById('wpScaling').value,   // calm|aggressive|insanity
    lastAuto: null,
    nextAuto: null,
    active: false
  };
  if(!site.name || !site.url || !site.user || !site.pass){ alert('Please fill all fields.'); return; }
  const sites = loadSites(); sites.push(site); saveSites(sites);
  ['wpName','wpUrl','wpUser','wpPass'].forEach(id => document.getElementById(id).value = '');
  renderWpSites();
}

function renderWpSites(){
  const wrap = document.getElementById('wpSites');
  const sites = loadSites();
  if(!sites.length){ wrap.innerHTML = '<div class="card"><em>No sites saved yet.</em></div>'; return; }
  wrap.innerHTML = sites.map(s=>`
    <div class="card siteCard" id="site-${s.id}">
      <h3>🌐 ${s.name}</h3>
      <div class="meta">${s.url}</div>
      <div class="meta">Status: ${s.status} · Export: ${s.exportMode} · Scaling: ${s.scaling}</div>
      <div class="meta">Last auto: ${s.lastAuto || '—'} · Next auto: ${s.nextAuto || '—'}</div>
      <div class="actions">
        <button class="pill" onclick="setActive('${s.id}')">${s.active ? 'Active ✅' : 'Set Active'}</button>
        <button class="pill" onclick="cycleExport('${s.id}')">Export: ${s.exportMode}</button>
        <button class="pill" onclick="cycleScaling('${s.id}')">Scaling: ${s.scaling}</button>
        <button class="pill" onclick="deleteSite('${s.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function setActive(id){
  const sites = loadSites().map(s => ({...s, active: s.id === id}));
  saveSites(sites); renderWpSites();
}
function cycleExport(id){
  const order = ['dashboard','manual','auto'];
  const sites = loadSites().map(s=>{
    if(s.id===id){ s.exportMode = order[(order.indexOf(s.exportMode)+1)%order.length]; }
    return s;
  });
  saveSites(sites); renderWpSites();
}
function cycleScaling(id){
  const order = ['calm','aggressive','insanity'];
  const sites = loadSites().map(s=>{
    if(s.id===id){ s.scaling = order[(order.indexOf(s.scaling)+1)%order.length]; }
    return s;
  });
  saveSites(sites); renderWpSites();
}
function deleteSite(id){
  const sites = loadSites().filter(s => s.id !== id);
  saveSites(sites); renderWpSites();
}
function renderAutoOverview(){
  const div = document.getElementById('autoOverview');
  const sites = loadSites();
  if(!sites.length){ div.innerHTML = '<div class="card"><em>No sites configured.</em></div>'; return; }
  div.innerHTML = sites.map(s=>`
    <div class="card">
      <h3>${s.name} ${s.active? '✅':''}</h3>
      <div class="meta">${s.url}</div>
      <div><span class="badge ${s.exportMode==='auto'?'on':''}">${s.exportMode.toUpperCase()}</span>
           <span class="badge">${s.scaling}</span></div>
      <div class="meta">Last: ${s.lastAuto||'—'} · Next: ${s.nextAuto||'—'}</div>
    </div>
  `).join('');
}
