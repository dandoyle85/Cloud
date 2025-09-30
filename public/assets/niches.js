const BASE = window.location.origin;
const grid = document.getElementById('nicheGrid');
const lastRun = document.getElementById('lastRun');
const logEl = document.getElementById('debugLog');
const siteInput = document.getElementById('siteId');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportCsv');
let niches = [];

function log(msg, obj){const line=`[${new Date().toLocaleString()}] ${msg}`;logEl.textContent=line+"\n"+logEl.textContent;if(obj) logEl.textContent=JSON.stringify(obj,null,2)+"\n"+logEl.textContent;}
refreshBtn.addEventListener('click', loadNiches);exportBtn.addEventListener('click', exportCSV);

async function loadNiches(){
  grid.innerHTML=''; lastRun.textContent='Loading...';
  try{const r=await fetch(`${BASE}/api/niches`); const data=await r.json(); niches=data.niches||[]; render();
    lastRun.textContent=`Last run: ${new Date().toLocaleString()} • ${niches.length} niches`; log('Niches loaded', niches.slice(0,5));
  }catch(e){ lastRun.textContent='Failed to load niches'; log('Niches error',{error:e.message});}
}

function render(){
  if(!niches.length){ grid.innerHTML='<div class="muted-row">No niches found.</div>'; return; }
  grid.innerHTML = niches.map(n=>card(n)).join('');
  document.querySelectorAll('[data-action="keywords"]').forEach(btn=>{
    btn.addEventListener('click',()=>{const seed=btn.getAttribute('data-seed'); const siteId=siteInput.value.trim();
      if(!siteId){ alert('Paste a site_id (UUID) at the top to send keywords.'); return; } runKeywords(siteId, seed);});
  });
}

function card(n){
  const s=n.source||'unknown', title=(n.title||n.term||''); const safe=title.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  return `<div class="card"><h3>${safe}</h3><div class="src">Source: ${s}</div>
    <div class="actions"><button data-action="keywords" data-seed="${safe}">Validate → Keywords</button></div></div>`;
}

async function runKeywords(site_id, seed){
  log('Expanding from niche card',{site_id,seed});
  const r=await fetch(`${BASE}/api/keywords`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id,seed})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok){ alert('Keyword expand failed: '+(data.error||'unknown')); log('Expand failed',data); return;}
  alert(`Inserted ${data.inserted||0} live keywords. Fallback shown in UI.`); log('Expand OK',data);
  window.location.href=`/keywords.html?seed=${encodeURIComponent(seed)}`;
}

function exportCSV(){
  if(!niches.length) return alert('Nothing to export');
  const lines=['title,source']; niches.forEach(n=>{const t=(n.title||n.term||'').replace(/"/g,'""'); lines.push(`"${t}",${n.source||''}`)});
  const blob=new Blob([lines.join('\n')],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`niches_${Date.now()}.csv`; a.click();
}
loadNiches();