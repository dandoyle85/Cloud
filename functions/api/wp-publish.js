// Echo stub — in Phase 2.1.1 we'll publish to WP REST API using saved creds.
export async function onRequest(context) {
  try {
    const body = await context.request.json();
    return new Response(JSON.stringify({ ok: true, received: body }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
