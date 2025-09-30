document.addEventListener('DOMContentLoaded',()=>{
  const seedInput=document.getElementById('seed');
  const saved=localStorage.getItem('ph.seed');
  if(saved) seedInput.value=saved;
});
document.getElementById('expandBtn').onclick=async()=>{
  const seed=document.getElementById('seed').value.trim();
  if(!seed) return alert('Enter a seed keyword');
  log('Expanding seed',seed);
  // Fake expansion for now, later will call /api/keywords
  const kws=[seed+' business',seed+' software',seed+' guide'];
  const ul=document.getElementById('kwList');
  ul.innerHTML=kws.map(k=>'<li>'+k+'</li>').join('');
  localStorage.setItem('ph.keywords',JSON.stringify(kws));
};