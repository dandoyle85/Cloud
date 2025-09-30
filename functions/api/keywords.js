export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { site_id, keywords, seed } = body;
    if (!site_id) return new Response(JSON.stringify({ error: "site_id required" }), { status: 400 });

    let collected=[];
    if (seed){
      const q=encodeURIComponent(seed);
      let gList=[],ytList=[],rdList=[];
      try{const g=await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`).then(r=>r.json());if(Array.isArray(g)) gList=g[1];}catch(e){}
      try{const yt=await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${q}`).then(r=>r.json());if(Array.isArray(yt)) ytList=yt[1];}catch(e){}
      try{const rd=await fetch(`https://www.reddit.com/search.json?q=${q}&sort=hot&limit=10`,{headers:{"User-Agent":"Mozilla/5.0"}}).then(r=>r.json());rdList=(rd?.data?.children||[]).map(p=>p.data?.title||"").filter(Boolean);}catch(e){}
      collected=[...gList.map(x=>({keyword:x,source:'google'})),...ytList.map(x=>({keyword:x,source:'youtube'})),...rdList.map(x=>({keyword:x,source:'reddit'}))];
      if(!collected.length){
        collected=[
          {keyword:`${seed} business ideas`,source:'fallback'},
          {keyword:`${seed} for beginners`,source:'fallback'},
          {keyword:`best ${seed} software`,source:'fallback'},
          {keyword:`${seed} side hustle`,source:'fallback'},
          {keyword:`${seed} 2025 trends`,source:'fallback'},
          {keyword:`cheap ${seed} setup`,source:'fallback'},
          {keyword:`how to start ${seed} business`,source:'fallback'},
          {keyword:`${seed} tips and tricks`,source:'fallback'}
        ];
      }
    }
    if(Array.isArray(keywords)){collected.push(...keywords.map(k=>({keyword:k,source:'manual'})));}
    const results=[];
    for(const k of collected){
      if(k.source==='fallback') continue;
      const res=await fetch(`${context.env.SUPABASE_URL}/rest/v1/keywords`,{
        method:"POST",headers:{apikey:context.env.SUPABASE_SERVICE_KEY,Authorization:`Bearer ${context.env.SUPABASE_SERVICE_KEY}`,"Content-Type":"application/json","Prefer":"return=representation"},
        body:JSON.stringify({site_id,keyword:k.keyword,source:k.source,created_at:new Date().toISOString()})
      });
      const data=await res.json();if(Array.isArray(data)&&data[0]) results.push(data[0]);
    }
    return new Response(JSON.stringify({inserted:results.length,keywords:collected}),{status:200});
  }catch(err){return new Response(JSON.stringify({error:err.message}),{status:500});}
}