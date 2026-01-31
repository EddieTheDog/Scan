const INTERVAL = 14;
let countdown = INTERVAL;
let timer = null;

async function load() {
  const res = await fetch("/list");
  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  if (!data.length) {
    list.innerHTML = "<p>No pending check-ins.</p>";
    return;
  }

  data.forEach(row => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${row.name}</strong><br>
      Seat: ${row.seat || "—"}<br><br>
      <button onclick="setStatus(${row.id}, 'approved')">Approve</button>
      <button onclick="setStatus(${row.id}, 'declined')">Decline</button>
    `;

    list.appendChild(div);
  });
}

async function setStatus(id, status) {
  await fetch("/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  });

  manualRefresh();
}

function manualRefresh() {
  clearInterval(timer);
  load();
  startTimer();
}

function startTimer() {
  countdown = INTERVAL;
  updateCountdown();

  timer = setInterval(() => {
    countdown--;
    updateCountdown();

    if (countdown <= 0) {
      manualRefresh();
    }
  }, 1000);
}

function updateCountdown() {
  document.getElementById("countdown").textContent =
    `Auto refresh in ${countdown}s`;
}

// INIT
load();
startTimer();
