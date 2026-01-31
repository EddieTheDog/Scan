async function load() {
  try {
    const res = await fetch("/list");
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Expected array, got:", data);
      document.getElementById("list").innerHTML = "Failed to load data.";
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

      QRCode.toCanvas(document.getElementById(`qr-${row.id}`), row.qr_value);
    });

  } catch (err) {
    console.error("Load error:", err);
    document.getElementById("list").innerHTML = "Error loading data.";
  }
}

async function approve(id) {
  try {
    const res = await fetch("/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.ok) load();
    else alert("Approve failed: " + data.error);
  } catch (err) {
    alert("Approve failed: " + err.message);
  }
}

setInterval(load, 2000);
load();
