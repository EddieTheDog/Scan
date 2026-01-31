async function load() {
  const res = await fetch("/list");
  const data = await res.json();

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

    QRCode.toCanvas(
      document.getElementById(`qr-${row.id}`),
      row.qr_value
    );
  });
}

async function approve(id) {
  await fetch("/approve", {
    method: "POST",
    body: JSON.stringify({ id })
  });
  load();
}

setInterval(load, 2000);
load();
