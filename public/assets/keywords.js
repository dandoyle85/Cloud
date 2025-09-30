
function getSeed(){const p=new URLSearchParams(location.search);return p.get('seed')||localStorage.getItem('lastSeed')||'';}
async function fetchKeywords(seed){
  document.getElementById('status').textContent="Fetching…";
  const res=await fetch('/api/keywords',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seed})});
  const j=await res.json();console.log(j);
  const tbody=document.querySelector('#kwTable tbody');tbody.innerHTML='';
  if(!res.ok){document.getElementById('status').textContent='Error '+(j.error||res.status);return;}
  (j.ideas||[]).forEach(r=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${r.keyword}</td><td>${r.volume??''}</td><td>${r.competition??''}</td><td>${r.cpc_low??''}</td><td>${r.cpc_high??''}</td>`;tbody.appendChild(tr);});
  document.getElementById('kwTable').style.display='table';
}
window.addEventListener('DOMContentLoaded',()=>{const s=getSeed();if(s){document.getElementById('seed').value=s;fetchKeywords(s);}document.getElementById('expand').onclick=()=>{const v=document.getElementById('seed').value.trim();if(v){localStorage.setItem('lastSeed',v);fetchKeywords(v);}};});
