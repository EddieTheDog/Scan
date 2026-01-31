export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // ---- SUBMIT CHECK-IN ----
    if (url.pathname === "/submit" && req.method === "POST") {
      const { qr, name, seat } = await req.json();

      await env.DB.prepare(`
        INSERT OR IGNORE INTO checkins
        (qr_value, name, seat, status, scanned_at)
        VALUES (?, ?, ?, 'pending', ?)
      `).bind(
        qr,
        name,
        seat || "",
        new Date().toISOString()
      ).run();

      return json({ ok: true });
    }

    // ---- CHECK STATUS (KIOSK POLLING) ----
    if (url.pathname === "/status") {
      const qr = url.searchParams.get("qr");

      const row = await env.DB.prepare(`
        SELECT status FROM checkins WHERE qr_value = ?
      `).bind(qr).first();

      if (!row) return json({ status: "pending" });

      return json({ status: row.status });
    }

    // ---- ADMIN LIST (PENDING ONLY) ----
    if (url.pathname === "/list") {
      const { results } = await env.DB.prepare(`
        SELECT * FROM checkins
        WHERE status = 'pending'
        ORDER BY scanned_at ASC
      `).all();

      return json(results);
    }

    // ---- APPROVE / DECLINE ----
    if (url.pathname === "/approve" && req.method === "POST") {
      const { id, status } = await req.json();

      await env.DB.prepare(`
        UPDATE checkins
        SET status = ?, approved_at = ?
        WHERE id = ?
      `).bind(
        status,
        new Date().toISOString(),
        id
      ).run();

      return json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  }
};

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
