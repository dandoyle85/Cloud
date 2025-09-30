
const asMicros=v=>(typeof v==='number'?Math.round(v/10000)/100:null);
async function getAccessToken(env){
  const body=new URLSearchParams({client_id:env.GOOGLE_ADS_CLIENT_ID,client_secret:env.GOOGLE_ADS_CLIENT_SECRET,refresh_token:env.GOOGLE_ADS_REFRESH_TOKEN,grant_type:"refresh_token"});
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});const j=await r.json();
  if(!r.ok) throw new Error("oauth_failed:"+JSON.stringify(j));return j.access_token;
}
export async function onRequestPost({request,env}){
  try{const {seed}=await request.json();if(!seed)return new Response(JSON.stringify({error:"Seed required"}),{status:400});
    const at=await getAccessToken(env);
    const ep=`https://googleads.googleapis.com/${env.GOOGLE_ADS_VERSION||"v16"}/customers/${env.GOOGLE_ADS_CUSTOMER_ID}:generateKeywordIdeas`;
    const body={language:`languageConstants/${env.GOOGLE_ADS_LANG||"1000"}`,geoTargetConstants:[`geoTargetConstants/${env.GOOGLE_ADS_GEO||"2840"}`],keywordSeed:{keywords:[seed]}};
    const r=await fetch(ep,{method:"POST",headers:{"Authorization":`Bearer ${at}`,"developer-token":env.GOOGLE_ADS_DEV_TOKEN,"login-customer-id":env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,"Content-Type":"application/json"},body:JSON.stringify(body)});
    const j=await r.json();if(!r.ok)return new Response(JSON.stringify({error:"google_ads_error",details:j}),{status:r.status});
    const ideas=(j.results||[]).map(x=>{const m=x.keywordIdeaMetrics||{};return{keyword:x.text,volume:m.avgMonthlySearches??null,competition:m.competition??null,cpc_low:asMicros(m.lowTopOfPageBidMicros),cpc_high:asMicros(m.highTopOfPageBidMicros)}});
    return new Response(JSON.stringify({ideas}),{headers:{"Content-Type":"application/json"}});
  }catch(e){return new Response(JSON.stringify({error:e.message}),{status:500});}
}
