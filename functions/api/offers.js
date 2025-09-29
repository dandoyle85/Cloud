export async function onRequest(context) {
  const offers = [
    { network: "ClickBank", name: "Drone Mapping Guide", commission: "50%", signup: "https://www.clickbank.com/" },
    { network: "Udemy", name: "AI Side Hustle Course", commission: "30%", signup: "https://www.udemy.com/" }
  ];
  return new Response(JSON.stringify({ count: offers.length, offers }), {
    headers: { "Content-Type": "application/json" }
  });
}
