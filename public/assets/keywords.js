const BASE = window.location.origin;
const logEl=document.getElementById('debugLog');
function log(msg,obj){const line=`[${new Date().toLocaleString()}] ${msg}`;logEl.textContent=line+"\n"+logEl.textContent;if(obj) logEl.textContent=JSON.stringify(obj,null,2)+"\n"+logEl.textContent;}
function toast(msg,type='ok'){const el=document.createElement('div');el.textContent=msg;el.className=`toast ${type}`;document.body.appendChild(el);setTimeout(()=>el.remove(),3000);}

const els={siteId:document.getElementById('siteId'),seed:document.getElementById('seed'),expandBtn:document.getElementById('expandBtn'),listBtn:document.getElementById('listBtn'),kwBody:document.getElementById('kwBody')};

els.expandBtn.addEventListener('click',()=>expandKeywords());
els.listBtn.addEventListener('click',()=>listKeywords());

async function expandKeywords(){
  const site_id=els.siteId.value.trim();
  const seed=els.seed.value.trim();
  if(!site_id||!seed) return toast('Need site_id + seed','warn');
  log('Expanding seed',{site_id,seed});
  const r=await fetch(`${BASE}/api/keywords`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id,seed})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok){toast(data.error||'Expand failed','err');log('Expand failed',data);return;}
  log('Expand success',data);
  renderTable(data.keywords||[]);
}

async function listKeywords(){
  const site_id=els.siteId.value.trim();
  if(!site_id) return;
  const r=await fetch(`${BASE}/api/keywords?site_id=${encodeURIComponent(site_id)}`);
  const data=await r.json().catch(()=>({}));
  if(!r.ok){toast('List failed','err');log('List failed',data);return;}
  renderTable(data.keywords||data||[]);
}

function renderTable(rows){
  if(!rows.length){els.kwBody.innerHTML='<tr class="muted-row"><td colspan="4">No keywords yet</td></tr>';return;}
  els.kwBody.innerHTML=rows.map(k=>{
    const badge=k.source==='fallback' ? '<span class="badge-fallback">Fallback</span>' : '<span class="badge-live">Live</span>';
    const saveBtn=k.source==='fallback'?`<button onclick="saveFallback('${k.keyword}')">Save</button>`:'Saved';
    return `<tr><td>${k.keyword}</td><td>${badge}</td><td>🔥</td><td>${saveBtn}</td></tr>`;
  }).join('');
}

async function saveFallback(keyword){
  const site_id=els.siteId.value.trim();
  const r=await fetch(`${BASE}/api/keywords`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id,keywords:[keyword]})});
  const data=await r.json();
  toast('Saved fallback');log('Saved fallback',data);
  listKeywords();
}
