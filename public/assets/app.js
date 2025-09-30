const grid=document.getElementById('nicheGrid');
async function fetchNiches(){
  try{
    const r=await fetch('/api/niches');
    const data=await r.json();
    grid.innerHTML='';
    (data.niches||[]).forEach(n=>{
      const text=typeof n==='string'?n:(n.title||'');
      if(!text)return;
      const card=document.createElement('div');
      card.className='card';
      card.textContent=text;
      card.addEventListener('click',()=>{
        window.location.href='/keywords.html?seed='+encodeURIComponent(text);
      });
      grid.appendChild(card);
    });
    log('Niches fetched',{count:data.niches?.length});
  }catch(e){log('Error fetching niches',{error:e.message});}
}
document.getElementById('refreshBtn')?.addEventListener('click',fetchNiches);
