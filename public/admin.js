const REFRESH_INTERVAL = 14;
let countdown = REFRESH_INTERVAL;
let countdownTimer = null;

async function loadPending() {
  const res = await fetch("/list");
  const data = await res.json();

  const container = document.getElementById("list");
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p>No pending check-ins.</p>";
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

    container.appendChild(div);
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

function startCountdown() {
  clearInterval(countdownTimer);
  countdown = REFRESH_INTERVAL;
  updateCountdown();

  countdownTimer = setInterval(() => {
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

function manualRefresh() {
  clearInterval(countdownTimer);
  loadPending();
  startCountdown();
}

// Initial load
loadPending();
startCountdown();
