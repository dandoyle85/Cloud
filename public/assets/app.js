
window.addEventListener("DOMContentLoaded", ()=>{
  const t=document.getElementById("debugToggle");
  if(t) t.addEventListener("click", ()=> document.getElementById("debugPanel").classList.toggle("show"));
});
