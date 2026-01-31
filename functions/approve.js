export async function onRequestPost({ request, env }) {
  const { id } = await request.json();

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
}
