const asMicrosToDollars = v => (typeof v === "number" ? Math.round(v / 10000) / 100 : null);

async function getAccessToken(env){
  const body=new URLSearchParams({
    client_id:env.GOOGLE_ADS_CLIENT_ID,
    client_secret:env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token:env.GOOGLE_ADS_REFRESH_TOKEN,
    grant_type:"refresh_token"
  });
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
  const j=await r.json();
  if(!r.ok) throw new Error("oauth_failed:"+JSON.stringify(j));
  return j.access_token;
}

export async function onRequestPost({request,env}){
  try{
    const {seed,geo=env.GOOGLE_ADS_GEO||"2840",lang=env.GOOGLE_ADS_LANG||"1000",pageSize=20}=await request.json();
    if(!seed) return new Response(JSON.stringify({error:"Seed required"}),{status:400});

    const accessToken=await getAccessToken(env);
    const endpoint=`https://googleads.googleapis.com/${env.GOOGLE_ADS_VERSION||"v16"}/customers/${env.GOOGLE_ADS_CUSTOMER_ID}:generateKeywordIdeas`;
    const body={
      language:`languageConstants/${lang}`,
      geoTargetConstants:[`geoTargetConstants/${geo}`],
      includeAdultKeywords:false,
      pageSize,
      keywordSeed:{keywords:[seed]}
    };

    const r=await fetch(endpoint,{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${accessToken}`,
        "developer-token":env.GOOGLE_ADS_DEV_TOKEN,
        "login-customer-id":env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
        "Content-Type":"application/json"
      },
      body:JSON.stringify(body)
    });
    const j=await r.json();
    if(!r.ok) return new Response(JSON.stringify({error:"google_ads_error",details:j}),{status:r.status});

    const ideas=(j.results||j.keywordIdeas||[]).map(x=>{
      const t=x.text||x.keyword||x.keywordText;
      const m=x.keywordIdeaMetrics||x.keywordMetrics||{};
      return {
        keyword:t,
        volume:m.avgMonthlySearches??null,
        competition:m.competition||m.competitionIndex||null,
        cpc_low:asMicrosToDollars(m.lowTopOfPageBidMicros),
        cpc_high:asMicrosToDollars(m.highTopOfPageBidMicros)
      };
    }).filter(x=>!!x.keyword);

    return new Response(JSON.stringify({count:ideas.length,ideas}),{headers:{"Content-Type":"application/json"}});
  }catch(err){
    return new Response(JSON.stringify({error:err.message}),{status:500});
  }
}