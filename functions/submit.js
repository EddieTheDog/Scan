export async function onRequestPost({ request, env }) {
  const { qr, name, seat } = await request.json();

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
}
