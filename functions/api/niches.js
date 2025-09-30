export async function onRequestGet(context){
  try{
    const niches=[];

    // Google Trends RSS
    try{const res=await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US");
      const xml=await res.text(); const re=/<title><!\[CDATA\[(.*?)\]\]><\/title>/g; let m,count=0;
      while((m=re.exec(xml))!==null && count<10){const t=m[1]; if(t && !/Daily Search Trends|Google Trends/.test(t)){niches.push({title:t,source:"google_trends"});count++;}}}catch(e){}

    // Reddit hot
    try{const r=await fetch("https://www.reddit.com/r/all/hot.json?limit=15",{headers:{"User-Agent":"Mozilla/5.0"}});
      const j=await r.json(); (j?.data?.children||[]).forEach(p=>{const t=p?.data?.title; if(t) niches.push({title:t,source:"reddit"});});}catch(e){}

    // Wikipedia top viewed (yesterday)
    try{const now=new Date(); const y=new Date(now.getTime()-86400000); const yyyy=y.getUTCFullYear(); const mm=String(y.getUTCMonth()+1).padStart(2,'0'); const dd=String(y.getUTCDate()).padStart(2,'0');
      const url=`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${yyyy}/${mm}/${dd}`;
      const r=await fetch(url); const j=await r.json(); (j?.items?.[0]?.articles||[]).slice(0,10).forEach(a=>niches.push({title:a.article.replace(/_/g,' '),source:"wikipedia"}));}catch(e){}

    // Invidious trending (best-effort)
    try{const r=await fetch("https://yewtu.be/feed/trending"); const xml=await r.text(); const re=/<title>([^<]+)<\/title>/g; let m,skip=0,c=0;
      while((m=re.exec(xml))!==null && c<10){const t=m[1]; if(++skip<=1) continue; niches.push({title:t,source:"youtube"}); c++;}}catch(e){}

    // Amazon Movers & Shakers (best-effort)
    try{const r=await fetch("https://www.amazon.com/gp/movers-and-shakers",{headers:{"User-Agent":"Mozilla/5.0"}}); const html=await r.text();
      const re=/aria-label="([^"]+?)"/g; let m,c=0; while((m=re.exec(html))!==null && c<10){niches.push({title:m[1],source:"amazon_try"}); c++;}}catch(e){}

    // Exploding Topics (best-effort)
    try{const r=await fetch("https://explodingtopics.com/"); const html=await r.text();
      const re=/<h2[^>]*class="[^"]*et-topic-title[^"]*"[^>]*>(.*?)<\/h2>/g; let m,c=0; while((m=re.exec(html))!==null && c<10){const t=m[1].replace(/<[^>]+>/g,''); niches.push({title:t,source:"exploding_topics_try"}); c++;}}catch(e){}

    // Dedup & cap
    const seen=new Set(); const clean=[];
    for(const n of niches){const key=(n.title||'').toLowerCase().trim(); if(!key||seen.has(key)) continue; seen.add(key); clean.push(n); if(clean.length>=40) break;}
    return new Response(JSON.stringify({count:clean.length,niches:clean}),{status:200,headers:{"Content-Type":"application/json"}});
  }catch(err){return new Response(JSON.stringify({error:err.message}),{status:500});}
}