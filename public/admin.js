// Load latest check-ins every 2 seconds
async function load() {
  try {
    const res = await fetch("/list");
    const data = await res.json();

    // Check for errors from the backend
    if (!Array.isArray(data)) {
      console.error("Expected array, got:", data);
      document.getElementById("list").innerHTML = "Failed to load data: " + (data.error || "Unknown error");
      return;
    }

    const el = document.getElementById("list");
    el.innerHTML = "";

    data.forEach(row => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.margin = "10px";
      div.style.padding = "10px";

      div.innerHTML = `
        <b>${row.name}</b><br>
        Seat: ${row.seat || "—"}<br>
        Status: ${row.status}<br>
        <canvas id="qr-${row.id}"></canvas><br>
        <button onclick="approve(${row.id})">Accept</button>
      `;

      el.appendChild(div);

      // Generate QR code on the canvas
      try {
        QRCode.toCanvas(document.getElementById(`qr-${row.id}`), row.qr_value);
      } catch (err) {
        console.error("QR generation error:", err);
      }
    });

  } catch (err) {
    console.error("Load error:", err);
    document.getElementById("list").innerHTML = "Error loading data: " + err.message;
  }
}

// Approve attendee
async function approve(id) {
  try {
    const res = await fetch("/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.ok) {
      load(); // refresh list after approval
    } else {
      alert("Approve failed: " + data.error);
    }
  } catch (err) {
    alert("Approve failed: " + err.message);
  }
}

// Auto-refresh every 2 seconds
setInterval(load, 2000);
load();
