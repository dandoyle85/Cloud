async function loadNiches(){
  const g=document.getElementById('nicheGrid'); g.innerHTML='<p>Loading…</p>';
  try{
    const r=await fetch('/api/niches'); const d=await r.json(); g.innerHTML='';
    (d.niches||[]).forEach(n=>{
      const card=document.createElement('div');
      card.className='panel';
      card.textContent=n;
      card.onclick=()=>{
        localStorage.setItem('ph.seed',n);
        log('Selected niche',n);
        window.location.href='keywords.html';
      };
      g.appendChild(card);
    });
    if((d.niches||[]).length===0){ g.innerHTML='<p>No niches found.</p>'; }
  }catch(e){ g.innerHTML='<p>⚠️ Could not fetch niches. Try again or add manually.</p>'; log('Niche error',e.message); }
}
document.getElementById('refreshNichesBtn').onclick=loadNiches;
document.getElementById('addNicheBtn').onclick=()=>{
  const v=document.getElementById('nicheInput').value.trim();
  if(!v) return;
  localStorage.setItem('ph.seed',v);
  log('Added niche',v);
  window.location.href='keywords.html';
};
document.addEventListener('DOMContentLoaded',loadNiches);