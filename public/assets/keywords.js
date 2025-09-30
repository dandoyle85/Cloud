const BASE = window.location.origin;
const logEl = document.getElementById('debugLog');

function log(msg,obj){const line=`[${new Date().toLocaleString()}] ${msg}`;logEl.textContent=line+"\n"+logEl.textContent;if(obj) logEl.textContent=JSON.stringify(obj,null,2)+"\n"+logEl.textContent;}
function toast(msg,type='ok'){const el=document.createElement('div');el.textContent=msg;el.className=`toast ${type}`;document.body.appendChild(el);setTimeout(()=>el.classList.add('show'),10);setTimeout(()=>{el.remove()},3000);}

const els={siteId:document.getElementById('siteId'),seed:document.getElementById('seed'),expandBtn:document.getElementById('expandBtn'),listBtn:document.getElementById('listBtn'),lastRun:document.getElementById('lastRun'),kwBody:document.getElementById('kwBody'),exportCsv:document.getElementById('exportCsv'),copyPrompt:document.getElementById('copyPrompt')};

els.expandBtn.addEventListener('click',async()=>{const site_id=els.siteId.value.trim();const seed=els.seed.value.trim();if(!site_id||!seed)return toast('Enter site_id + seed','warn');log('Expanding seed',{site_id,seed});const r=await fetch(`${BASE}/api/keywords`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id,seed})});const data=await r.json().catch(()=>({}));if(!r.ok){toast(data.error||'Expand failed','err');log('Expand failed',data);showFallback(seed);return;}toast(`Expanded ${data.inserted} keywords`);log('Expand success',data);els.lastRun.textContent=`Last saved: ${new Date().toLocaleString()}`;currentKeywords=data.keywords||[];renderTable();});

els.listBtn.addEventListener('click',listKeywords);els.exportCsv.addEventListener('click',()=>exportCSV(currentKeywords));els.copyPrompt.addEventListener('click',copyElitePrompt);

let currentKeywords=[];
async function listKeywords(){const site_id=els.siteId.value.trim();if(!site_id)return;const r=await fetch(`${BASE}/api/keywords?site_id=${encodeURIComponent(site_id)}`);const data=await r.json().catch(()=>({}));if(!r.ok){toast('List failed','err');log('List failed',data);return;}currentKeywords=data.keywords||data||[];log('Listed keywords',currentKeywords);renderTable();}

function renderTable(){if(!currentKeywords.length){els.kwBody.innerHTML='<tr class="muted-row"><td colspan="6">No keywords yet</td></tr>';return;}const html=currentKeywords.map(k=>`<tr><td><input type="checkbox"></td><td>${k.keyword}</td><td>${k.source||'Mixed'}</td><td>🔥</td><td>-</td><td><button class="ghost">Save</button></td></tr>`).join('');els.kwBody.innerHTML=html;}

function exportCSV(rows){if(!rows.length)return toast('Nothing to export','warn');const lines=['keyword'];rows.forEach(r=>lines.push(r.keyword));const blob=new Blob([lines.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`keywords_${Date.now()}.csv`;a.click();}

function copyElitePrompt(){const seed=els.seed.value.trim()||'YOUR SEED';const prompt=`You are a world-class SEO strategist, growth hacker, and digital empire builder.\nExpand the seed keyword: "${seed}" into 25+ long-tail keywords with:\n• high traffic potential (≥ 1,000/mo)\n• low competition\n• strong monetization intent (best, top, review, 2025, software)\nFor each keyword, return JSON ONLY:\n[\n { "keyword":"...", "volume":0, "competition":"low", "intent":"commercial",\n   "titles":["SEO title 1","SEO title 2"], "shorts":["YT Short idea"], "pins":["Pinterest idea"] }\n]\nDo not include explanations.`;navigator.clipboard.writeText(prompt);toast('Elite prompt copied','ok');log('Elite prompt',prompt);}

function showFallback(seed){const msg=`No keywords generated. Use this elite ChatGPT prompt.`;toast(msg,'warn');copyElitePrompt(seed);}
