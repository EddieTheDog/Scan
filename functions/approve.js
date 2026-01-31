export async function onRequestPost({ request, env }) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) throw new Error("ID and status required");
    if (!env.DB) throw new Error("DB binding not found");

    await env.DB.prepare(`
      UPDATE checkins
      SET status = ?, approved_at = ?
      WHERE id = ?
    `)
    .bind(status, new Date().toISOString(), id)
    .run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Approve/Decline error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
