let refreshEvery = 14;
let remaining = refreshEvery;
let timer;

async function load() {
  const res = await fetch("/list");
  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(row => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <b>${row.name}</b><br>
      Seat: ${row.seat || "—"}<br>
      <canvas id="qr-${row.id}"></canvas><br>
      <button onclick="updateStatus(${row.id}, 'approved')">Approve</button>
      <button onclick="updateStatus(${row.id}, 'declined')">Decline</button>
    `;

    list.appendChild(div);
    QRCode.toCanvas(document.getElementById(`qr-${row.id}`), row.qr_value);
  });
}

async function updateStatus(id, status) {
  await fetch("/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  });
  manualRefresh();
}

function startTimer() {
  clearInterval(timer);
  remaining = refreshEvery;
  updateCountdown();

  timer = setInterval(() => {
    remaining--;
    updateCountdown();
    if (remaining <= 0) manualRefresh();
  }, 1000);
}

function updateCountdown() {
  document.getElementById("countdown").textContent =
    `Next refresh in ${remaining}s`;
}

function manualRefresh() {
  clearInterval(timer);
  load();
  startTimer();
}

load();
startTimer();
