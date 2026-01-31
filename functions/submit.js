export async function onRequestPost({ request, env }) {
  try {
    const { qr, name, seat } = await request.json();

    if (!qr || !name) {
      return new Response(JSON.stringify({ ok: false, error: "QR and Name required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!env.DB) throw new Error("DB binding not found");

    await env.DB.prepare(`
      INSERT OR IGNORE INTO checkins
      (qr_value, name, seat, status, scanned_at)
      VALUES (?, ?, ?, 'pending', ?)
    `)
    .bind(qr, name, seat, new Date().toISOString())
    .run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Submit error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
