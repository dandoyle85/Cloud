const BASE=window.location.origin;
const logEl=document.getElementById('debugLog');
const filterBar=document.getElementById('kwFilterBar');
const els={siteId:document.getElementById('siteId'),seed:document.getElementById('seed'),expandBtn:document.getElementById('expandBtn'),listBtn:document.getElementById('listBtn'),kwBody:document.getElementById('kwBody'),counter:document.getElementById('resultsCounter'),exportCsv:document.getElementById('exportCsv')};
let allKeywords=[];

function log(msg,obj){const line=`[${new Date().toLocaleString()}] ${msg}`;logEl.textContent=line+"\n"+logEl.textContent;if(obj) logEl.textContent=JSON.stringify(obj,null,2)+"\n"+logEl.textContent;}
els.expandBtn.addEventListener('click',()=>expandKeywords());els.listBtn.addEventListener('click',()=>listKeywords());filterBar.addEventListener('change',renderTable);els.exportCsv.addEventListener('click',exportCSV);

async function expandKeywords(){const site_id=els.siteId.value.trim();const seed=els.seed.value.trim();if(!site_id||!seed){alert('Need site_id + seed');return;}
log('Expanding seed',{site_id,seed});const r=await fetch(`${BASE}/api/keywords`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id,seed})});const data=await r.json().catch(()=>({}));
if(!r.ok){alert(data.error||'Expand failed');log('Expand failed',data);return;}allKeywords=data.keywords||[];log(`Expand success → ${allKeywords.length} keywords`,data);renderTable();}

async function listKeywords(){const site_id=els.siteId.value.trim();if(!site_id)return;const r=await fetch(`${BASE}/api/keywords?site_id=${encodeURIComponent(site_id)}`);const data=await r.json().catch(()=>({}));
if(!r.ok){alert('List failed');log('List failed',data);return;}allKeywords=data.keywords||data||[];renderTable();}

function renderTable(){const active=[...filterBar.querySelectorAll('input:checked')].map(cb=>cb.value);
let rows=allKeywords;if(active.length){rows=rows.filter(r=>active.includes(r.source));}
if(!rows.length){els.kwBody.innerHTML='<tr class="muted-row"><td colspan="4">No keywords</td></tr>';els.counter.textContent='Results: 0';return;}
els.kwBody.innerHTML=rows.map(k=>rowHtml(k)).join('');els.counter.textContent=`Results: ${rows.length}`;}

function rowHtml(k){const badgeClass=`badge-src badge-${k.source||'unknown'}`;const score=scoreKeyword(k.keyword,k.source);
const saveBtn=k.source==='fallback'?`<button onclick="saveFallback('${k.keyword.replace(/'/g,"\'")}')">Save</button>`:'Saved';
return `<tr><td>${escapeHtml(k.keyword)}</td><td><span class="${badgeClass}">${k.source}</span></td><td>${score}</td><td>${saveBtn}</td></tr>`;}

function scoreKeyword(keyword,source){let score=0;const kw=keyword.toLowerCase();if(['google','youtube','reddit'].includes(source))score+=3;if(['modifier','paa_try','related_try'].includes(source))score+=2;if(source==='fallback')score+=1;
if(/best|cheap|review|software|guide|2025/.test(kw))score+=2;const flames=Math.min(5,Math.max(1,Math.round(score/2)));return '🔥'.repeat(flames);}

function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

async function saveFallback(keyword){const site_id=els.siteId.value.trim();const r=await fetch(`${BASE}/api/keywords`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id,keywords:[keyword]})});const data=await r.json();log('Saved fallback',data);listKeywords();}

function exportCSV(){const active=[...filterBar.querySelectorAll('input:checked')].map(cb=>cb.value);let rows=allKeywords;if(active.length){rows=rows.filter(r=>active.includes(r.source));}
if(!rows.length){alert('Nothing to export');return;}const lines=['keyword,source,score'];rows.forEach(k=>{const score=scoreKeyword(k.keyword,k.source);const safe=k.keyword.replace(/"/g,'""');lines.push(`"${safe}",${k.source},${score}`);});
const fname=active.length?`keywords_${active.join('_')}_${Date.now()}.csv`:`keywords_all_${Date.now()}.csv`;const blob=new Blob([lines.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;a.click();}
