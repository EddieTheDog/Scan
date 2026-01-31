let currentQR = null;
let pollingTimer = null;

function goToInfo() {
  const qrInput = document.getElementById("qr");
  const qr = qrInput.value.trim();

  if (!qr) {
    alert("Please enter or scan a QR code");
    return;
  }

  currentQR = qr;

  document.getElementById("qrPage").classList.remove("active");
  document.getElementById("infoPage").classList.add("active");
}

async function submitForm() {
  const name = document.getElementById("name").value.trim();
  const seat = document.getElementById("seat").value.trim();
  const statusEl = document.getElementById("status");

  if (!name) {
    alert("Please enter your name");
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

  pollingTimer = setInterval(checkStatus, 5000);
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

async function checkStatus() {
  if (!currentQR) return;

  try {
    const res = await fetch(
      `/status?qr=${encodeURIComponent(currentQR)}`
    );
    const data = await res.json();

    if (data.status === "pending") return;

    stopPolling();

    const statusEl = document.getElementById("status");
    statusEl.textContent =
      data.status === "approved"
        ? "✅ Approved — please proceed"
        : "❌ Declined — please see staff";

    setTimeout(resetKiosk, 2500);

  } catch (err) {
    // Network hiccup → try again next interval
  }
}

function resetKiosk() {
  stopPolling();
  currentQR = null;

  document.getElementById("qr").value = "";
  document.getElementById("name").value = "";
  document.getElementById("seat").value = "";
  document.getElementById("status").textContent = "";

  document.getElementById("infoPage").classList.remove("active");
  document.getElementById("qrPage").classList.add("active");
}
