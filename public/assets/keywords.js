
function showStatus(msg,type){
  const box=document.getElementById("statusBox");
  if(!box) return;
  box.textContent=msg;
  box.className=type;
  box.style.display="block";
  setTimeout(()=>{box.style.display="none";},5000);
}

async function expandKeywords(seed){
  try{
    console.log("📤 Sending seed to backend:", seed);
    const res=await fetch('/api/keywords',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({seed})});
    console.log("📥 Raw response object:", res);
    const data=await res.json().catch(err=>{console.error("❌ Failed to parse JSON:",err);throw err;});
    console.log("✅ Parsed response JSON:", data);
    if(data.error){console.error("⚠️ Backend error:",data.error,"Details:",data.details);showStatus("❌ Error: "+data.error,"err");return;}
    const ideas=data.ideas||[];
    if(ideas.length===0){showStatus("⚠️ No results found","err");return;}
    const tbody=document.querySelector('#kwTable tbody');tbody.innerHTML="";
    ideas.forEach(r=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${r.keyword||''}</td><td>${r.volume??''}</td><td>${r.competition??''}</td><td>${r.cpc_low??''}</td><td>${r.cpc_high??''}</td>`;
      tbody.appendChild(tr);
    });
    document.getElementById('kwTable').style.display="table";
    showStatus("✅ Loaded "+ideas.length+" results for: "+seed,"ok");
  }catch(e){
    console.error("🚨 Expand keywords failed:",e);
    showStatus("❌ Error: "+e.message,"err");
  }
}

window.addEventListener('DOMContentLoaded',()=>{
  const expandBtn=document.getElementById("expand");
  if(expandBtn){
    expandBtn.onclick=()=>{
      const v=document.getElementById("seed").value.trim();
      if(v) expandKeywords(v);
    };
  }
});
