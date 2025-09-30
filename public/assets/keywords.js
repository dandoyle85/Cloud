const log=(...a)=>{console.log(...a);const d=document.getElementById('debugLog');if(d) d.textContent+=a.join(' ')+'\n'};
document.getElementById('debugToggle').onclick=()=>document.getElementById('debugPanel').classList.toggle('show');

document.addEventListener('DOMContentLoaded',()=>{
  const seedInput=document.getElementById('seed');
  const saved=localStorage.getItem('lastSeed');
  if(saved) seedInput.value=saved;
});

document.getElementById('expandBtn').onclick=async()=>{
  const seed=document.getElementById('seed').value.trim();
  if(!seed) return alert('Enter a seed keyword');
  localStorage.setItem('lastSeed',seed);
  log('Expanding seed',seed);

  try{
    const r=await fetch('/api/keywords',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seed})});
    const j=await r.json();
    log('API response',JSON.stringify(j,null,2));

    const tbody=document.querySelector('#kwTable tbody'); tbody.innerHTML='';
    if(!r.ok){ tbody.innerHTML='<tr><td colspan=5 style="color:#e5533d">Error: '+(j.error||'failed')+'</td></tr>'; return; }

    (j.ideas||[]).forEach(row=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${row.keyword}</td>
        <td>${row.volume??''}</td>
        <td>${row.competition??''}</td>
        <td>${row.cpc_low!=null?'$'+row.cpc_low.toFixed(2):''}</td>
        <td>${row.cpc_high!=null?'$'+row.cpc_high.toFixed(2):''}</td>`;
      tbody.appendChild(tr);
    });
  }catch(e){ log('Error',e.message); }
};