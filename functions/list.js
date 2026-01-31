export async function onRequestGet({ env }) {
  try {
    if (!env.DB) throw new Error("DB binding not found");

    const { results } = await env.DB.prepare(`
      SELECT * FROM checkins
      ORDER BY scanned_at DESC
      LIMIT 20
    `).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("List error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
