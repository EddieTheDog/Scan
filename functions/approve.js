export async function onRequestPost({ request, env }) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: "ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(`
      UPDATE checkins
      SET status='approved',
          approved_at=?
      WHERE id=?
    `)
    .bind(new Date().toISOString(), id)
    .run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
