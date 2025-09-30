const debugBtn=document.getElementById('debugToggle');const debugPanel=document.getElementById('debugPanel');const logEl=document.getElementById('debugLog');
if(debugBtn){debugBtn.addEventListener('click',()=>{debugBtn.classList.toggle('active');debugPanel.classList.toggle('active');});}
const links=document.querySelectorAll('nav a');links.forEach(l=>{if(l.getAttribute('href')===window.location.pathname){l.classList.add('active');}});
function log(msg,obj){const line=`[${new Date().toLocaleString()}] ${msg}`;if(logEl){logEl.textContent=line+"\n"+logEl.textContent;if(obj) logEl.textContent=JSON.stringify(obj,null,2)+"\n"+logEl.textContent;}}
