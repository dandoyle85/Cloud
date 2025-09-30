
function getSeed(){ const p=new URLSearchParams(location.search); return p.get('seed')||localStorage.getItem('lastSeed')||''; }

async function fetchKeywords(seed){
  const status=document.getElementById('status');
  const table=document.getElementById('kwTable');
  status.textContent="Fetching…"; status.className="";
  table.style.display="none";
  try{
    const res=await fetch('/api/keywords',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seed})});
    const json=await res.json();
    document.getElementById('debugLog').textContent+=JSON.stringify(json,null,2)+"\n";
    if(!res.ok){ status.textContent="❌ Error: "+(json.error||res.status); status.className="err"; return; }
    const ideas=json.ideas||[];
    if(ideas.length===0){ status.textContent="⚠️ No results found"; status.className="err"; return; }
    const tbody=document.querySelector('#kwTable tbody'); tbody.innerHTML="";
    ideas.forEach(r=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${r.keyword||''}</td><td>${r.volume??''}</td><td>${r.competition??''}</td><td>${r.cpc_low??''}</td><td>${r.cpc_high??''}</td>`;
      tbody.appendChild(tr);
    });
    table.style.display="table";
    status.textContent="Loaded "+ideas.length+" results for: "+seed; status.className="ok";
  }catch(e){ status.textContent="❌ Error: "+e.message; status.className="err"; }
}

window.addEventListener('DOMContentLoaded',()=>{
  const seed=getSeed();
  if(seed){ document.getElementById('seed').value=seed; fetchKeywords(seed); }
  document.getElementById('expand').onclick=()=>{
    const v=document.getElementById('seed').value.trim();
    if(!v){ alert('Enter a seed'); return; }
    localStorage.setItem('lastSeed',v);
    fetchKeywords(v);
  };
});
