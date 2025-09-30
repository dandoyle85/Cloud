async function loadNiches(){
  try {
    const r = await fetch('/api/niches');
    const d = await r.json();
    const g = document.getElementById('nicheGrid');
    g.innerHTML = '';
    (d.niches||[]).forEach(n=>{
      const card=document.createElement('div');
      card.className='panel';
      card.textContent=n;
      card.onclick=()=>{
        log('Selected niche',n);
      };
      g.appendChild(card);
    });
    log('Niches loaded',d);
  } catch(e){ log('Niche error',e.message); }
}
document.getElementById('refreshNichesBtn').onclick=loadNiches;
document.addEventListener('DOMContentLoaded',loadNiches);