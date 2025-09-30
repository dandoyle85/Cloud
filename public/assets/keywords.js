const BASE=window.location.origin;const logEl=document.getElementById('debugLog');const liveCountEl=document.getElementById('liveCount');const fallbackCountEl=document.getElementById('fallbackCount');let allKeywords=[];let activeFilter="all";
function log(msg,obj){const line=`[${new Date().toLocaleString()}] ${msg}`;logEl.textContent=line+"\n"+logEl.textContent;if(obj) logEl.textContent=JSON.stringify(obj,null,2)+"\n"+logEl.textContent;}
const els={siteId:document.getElementById('siteId'),seed:document.getElementById('seed'),expandBtn:document.getElementById('expandBtn'),listBtn:document.getElementById('listBtn'),kwBody:document.getElementById('kwBody')};
els.expandBtn.addEventListener('click',expandKeywords);els.listBtn.addEventListener('click',listKeywords);
if(liveCountEl&&fallbackCountEl){liveCountEl.addEventListener('click',()=>toggleFilter('live'));fallbackCountEl.addEventListener('click',()=>toggleFilter('fallback'));}
async function expandKeywords(){const site_id=els.siteId.value.trim();const seed=els.seed.value.trim();if(!site_id||!seed){alert('Need site_id + seed');return;}
log('Expanding seed',{site_id,seed});const r=await fetch(`${BASE}/api/keywords`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id,seed})});const data=await r.json().catch(()=>({}));
if(!r.ok){alert(data.error||'Expand failed');log('Expand failed',data);return;}allKeywords=data.keywords||[];const c=countBySource(allKeywords);log(`Expand success → ${c.live} live, ${c.fallback} fallback`,data);renderTable();}
async function listKeywords(){const site_id=els.siteId.value.trim();if(!site_id)return;const r=await fetch(`${BASE}/api/keywords?site_id=${encodeURIComponent(site_id)}`);const data=await r.json().catch(()=>({}));
if(!r.ok){alert('List failed');log('List failed',data);return;}allKeywords=data.keywords||data||[];renderTable();}
function renderTable(){let rows=allKeywords;if(activeFilter==='live')rows=rows.filter(r=>r.source!=='fallback');if(activeFilter==='fallback')rows=rows.filter(r=>r.source==='fallback');
const counts=countBySource(allKeywords);if(liveCountEl)liveCountEl.textContent=`Live: ${counts.live}`;if(fallbackCountEl)fallbackCountEl.textContent=`Fallback: ${counts.fallback}`;
if(liveCountEl)liveCountEl.classList.toggle('active',activeFilter==='live');if(fallbackCountEl)fallbackCountEl.classList.toggle('active',activeFilter==='fallback');
if(!rows.length){els.kwBody.innerHTML='<tr class="muted-row"><td colspan="4">No keywords</td></tr>';return;}
els.kwBody.innerHTML=rows.map(k=>{const badge=k.source==='fallback'?'<span class="badge-fallback">Fallback</span>':'<span class="badge-live">Live</span>';
const saveBtn=k.source==='fallback'?`<button onclick="saveFallback('${k.keyword.replace(/'/g,"\\'")}')">Save</button>`:'Saved';
return `<tr><td>${escapeHtml(k.keyword)}</td><td>${badge}</td><td>🔥</td><td>${saveBtn}</td></tr>`;}).join('');}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function toggleFilter(type){if(activeFilter===type){activeFilter='all';log('Filter reset → All');}else{activeFilter=type;log(`Filter applied → ${type} only`);}renderTable();}
function countBySource(rows){let live=0,fallback=0;rows.forEach(r=>{if(r.source==='fallback')fallback++;else live++;});return{live,fallback};}
async function saveFallback(keyword){const site_id=els.siteId.value.trim();const r=await fetch(`${BASE}/api/keywords`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id,keywords:[keyword]})});const data=await r.json();log('Saved fallback',data);listKeywords();}
document.addEventListener('DOMContentLoaded',()=>{const p=new URLSearchParams(location.search);if(p.get('seed')){const s=p.get('seed');const seedEl=document.getElementById('seed');if(seedEl){seedEl.value=s;seedEl.scrollIntoView({behavior:'smooth'});}}});