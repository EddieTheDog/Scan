export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT * FROM checkins
    ORDER BY scanned_at DESC
    LIMIT 20
  `).all();

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
}
