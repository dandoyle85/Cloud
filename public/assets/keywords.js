let current=[];
function render(){const b=document.getElementById('kwBody');b.innerHTML=current.map(k=>'<tr><td>'+k.keyword+'</td><td>'+k.source+'</td></tr>').join('')}
async function loadSites(){const r=await fetch('/api/sites');const d=await r.json();const s=document.getElementById('siteSelect');s.innerHTML=d.map(x=>'<option value='+x.id+'>'+x.site_name+'</option>').join('')}
async function loadSeeds(){const r=await fetch('/api/niches');const d=await r.json();const s=document.getElementById('seedSuggestions');s.innerHTML=d.niches.map(x=>'<option>'+x+'</option>').join('')}
document.getElementById('expandBtn').onclick=async()=>{const site=document.getElementById('siteSelect').value;const seed=document.getElementById('seed').value;const r=await fetch('/api/keywords',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site_id:site,seed})});const d=await r.json();current=d.keywords;render()}
document.getElementById('refreshSeedsBtn').onclick=loadSeeds;
document.getElementById('exportCsvBtn').onclick=()=>{let csv='keyword,source\n'+current.map(k=>`"${k.keyword}",${k.source}`).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv]));a.download='keywords.csv';a.click()}
document.getElementById('exportSqlBtn').onclick=()=>{let sql='insert into keywords(site_id,keyword,source) values '+current.map(k=>`('SITE','${k.keyword}','${k.source}')`).join(',')+';';navigator.clipboard.writeText(sql);alert('SQL copied')}
document.getElementById('copyJsonBtn').onclick=()=>{navigator.clipboard.writeText(JSON.stringify(current,null,2));alert('JSON copied')}
document.addEventListener('DOMContentLoaded',()=>{loadSites();loadSeeds();});