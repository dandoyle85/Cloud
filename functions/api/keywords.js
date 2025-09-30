export async function onRequestPost(context){
  try{
    const body=await context.request.json();
    const { site_id, keywords, seed } = body;
    if(!site_id) return new Response(JSON.stringify({error:'site_id required'}),{status:400});

    let collected=[];
    if(seed){
      const q=encodeURIComponent(seed); let gList=[],ytList=[],rdList=[],paaList=[],relList=[];

      try{const g=await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${q}`).then(r=>r.json()); if(Array.isArray(g)) gList=g[1];}catch(e){}
      try{const yt=await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${q}`).then(r=>r.json()); if(Array.isArray(yt)) ytList=yt[1];}catch(e){}
      try{const rd=await fetch(`https://www.reddit.com/search.json?q=${q}&sort=hot&limit=10`,{headers:{"User-Agent":"Mozilla/5.0"}}).then(r=>r.json()); rdList=(rd?.data?.children||[]).map(p=>p.data?.title||'').filter(Boolean);}catch(e){}

      // PAA/Related via DuckDuckGo (best-effort)
      try{const duck=await fetch(`https://duckduckgo.com/html/?q=${q}+people+also+ask`); const html=await duck.text();
        const re=/<a[^>]+class="result__a"[^>]*>(.*?)<\/a>/g; let m,c=0; while((m=re.exec(html))!==null && c<10){const t=m[1].replace(/<[^>]+>/g,'').trim(); if(t) paaList.push(t); c++;}}catch(e){}
      try{const duck2=await fetch(`https://duckduckgo.com/html/?q=${q}+related+searches`); const html2=await duck2.text();
        const re2=/<a[^>]+class="result__a"[^>]*>(.*?)<\/a>/g; let m2,c2=0; while((m2=re2.exec(html2))!==null && c2<10){const t=m2[1].replace(/<[^>]+>/g,'').trim(); if(t) relList.push(t); c2++;}}catch(e){}

      const mods=["best","cheap","2025","guide","review","alternative","software","business","vs"];
      const modCombos=mods.map(m=>`${seed} ${m}`);

      collected=[
        ...gList.map(x=>({keyword:String(x),source:'google'})),
        ...ytList.map(x=>({keyword:String(x),source:'youtube'})),
        ...rdList.map(x=>({keyword:String(x),source:'reddit'})),
        ...paaList.map(x=>({keyword:String(x),source:'paa_try'})),
        ...relList.map(x=>({keyword:String(x),source:'related_try'})),
        ...modCombos.map(x=>({keyword:String(x),source:'modifier'})),
      ].filter(k=>k.keyword && k.keyword.length<120);

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
        method:'POST',
        headers:{apikey:context.env.SUPABASE_SERVICE_KEY,Authorization:`Bearer ${context.env.SUPABASE_SERVICE_KEY}`,'Content-Type':'application/json','Prefer':'return=representation'},
        body:JSON.stringify({site_id,keyword:k.keyword,source:k.source,created_at:new Date().toISOString()})
      });
      const data=await res.json(); if(Array.isArray(data)&&data[0]) results.push(data[0]);
    }

    return new Response(JSON.stringify({inserted:results.length,keywords:collected}),{status:200});
  }catch(err){return new Response(JSON.stringify({error:err.message}),{status:500});}
}

export async function onRequestGet(context){
  const url=new URL(context.request.url); const site_id=url.searchParams.get('site_id');
  if(!site_id) return new Response(JSON.stringify({error:'site_id required'}),{status:400});
  const r=await fetch(`${context.env.SUPABASE_URL}/rest/v1/keywords?site_id=eq.${site_id}&select=*`,{
    headers:{apikey:context.env.SUPABASE_SERVICE_KEY,Authorization:`Bearer ${context.env.SUPABASE_SERVICE_KEY}`}
  });
  const j=await r.json(); return new Response(JSON.stringify({keywords:j}),{status:200,headers:{'Content-Type':'application/json'}});
}