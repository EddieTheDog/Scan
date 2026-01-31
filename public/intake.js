let currentQR = null;
let pollTimer = null;

function nextStep() {
  const qrInput = document.getElementById("qr");
  const qr = qrInput.value.trim();

  if (!qr) {
    alert("Enter QR code");
    return;
  }

  currentQR = qr;

  document.getElementById("stepQR").style.display = "none";
  document.getElementById("stepForm").style.display = "block";
}

async function submitForm() {
  const name = document.getElementById("name").value.trim();
  const seat = document.getElementById("seat").value.trim();
  const statusEl = document.getElementById("status");

  if (!name) {
    alert("Name required");
    return;
  }

  statusEl.textContent = "⏳ Awaiting approval…";

  await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      qr: currentQR,
      name,
      seat
    })
  });

  startPolling();
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(checkStatus, 5000);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function checkStatus() {
  const res = await fetch(`/status?qr=${encodeURIComponent(currentQR)}`);
  const data = await res.json();

  if (data.status === "pending") return;

  stopPolling();

  const statusEl = document.getElementById("status");
  statusEl.textContent =
    data.status === "approved"
      ? "✅ Approved — please proceed"
      : "❌ Declined — please see staff";

  setTimeout(resetKiosk, 3000);
}

function resetKiosk() {
  stopPolling();
  currentQR = null;

  document.getElementById("qr").value = "";
  document.getElementById("name").value = "";
  document.getElementById("seat").value = "";
  document.getElementById("status").textContent = "";

  document.getElementById("stepForm").style.display = "none";
  document.getElementById("stepQR").style.display = "block";
}
