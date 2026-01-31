const statusEl = document.getElementById("status");

// Load pending check-ins
async function load() {
  try {
    statusEl.textContent = ""; // Clear any previous status messages

    const res = await fetch("/list");
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Expected array, got:", data);
      statusEl.textContent = "Hold: There might be technical difficulties.";
      return;
    }

    const el = document.getElementById("list");
    el.innerHTML = "";

    // Only show entries with status 'pending'
    const pending = data.filter(row => row.status === "pending");

    if (pending.length === 0) {
      el.innerHTML = "<i>No pending check-ins</i>";
      return;
    }

    pending.forEach(row => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.margin = "10px";
      div.style.padding = "10px";

      div.innerHTML = `
        <b>${row.name}</b><br>
        Seat: ${row.seat || "—"}<br>
        Status: ${row.status}<br>
        <canvas id="qr-${row.id}"></canvas><br>
        <button onclick="approve(${row.id}, this)">Approve</button>
        <button onclick="decline(${row.id}, this)">Decline</button>
      `;

      el.appendChild(div);

      try {
        QRCode.toCanvas(document.getElementById(`qr-${row.id}`), row.qr_value);
      } catch (err) {
        console.error("QR generation error:", err);
      }
    });

  } catch (err) {
    console.error("Load error:", err);
    statusEl.textContent = "Hold: There might be technical difficulties.";
  }
}

// Approve attendee
async function approve(id, btn) {
  await updateStatus(id, "approved", btn);
}

// Decline attendee
async function decline(id, btn) {
  await updateStatus(id, "declined", btn);
}

// Update status in DB and remove from screen
async function updateStatus(id, newStatus, btn) {
  const parent = btn.closest("div");
  parent.style.opacity = 0.5; // visually indicate processing
  statusEl.textContent = "Hold: Please wait...";

  try {
    const res = await fetch("/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }) // modify approve.js to accept status
    });
    const data = await res.json();
    if (data.ok) {
      parent.remove(); // remove entry from admin screen
      statusEl.textContent = "";
    } else {
      statusEl.textContent = "Hold: Error updating entry, try again.";
      parent.style.opacity = 1;
    }
  } catch (err) {
    statusEl.textContent = "Hold: Technical difficulties.";
    parent.style.opacity = 1;
    console.error(err);
  }
}

// Auto-refresh every 2 seconds
setInterval(load, 2000);
load();
