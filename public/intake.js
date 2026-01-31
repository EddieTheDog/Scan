let currentQR = null;
let polling = false;

function goToInfo() {
  const qr = document.getElementById("qr").value.trim();
  if (!qr) return alert("Enter QR code");

  currentQR = qr;
  document.getElementById("qrPage").classList.remove("active");
  document.getElementById("infoPage").classList.add("active");
}

async function submitForm() {
  const name = document.getElementById("name").value.trim();
  const seat = document.getElementById("seat").value.trim();
  const statusEl = document.getElementById("status");

  if (!name) return alert("Enter name");

  statusEl.textContent = "Awaiting approval…";
  polling = true;

  await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qr: currentQR, name, seat })
  });

  pollStatus();
}

async function pollStatus() {
  if (!polling || !currentQR) return;

  try {
    const res = await fetch(`/status?qr=${encodeURIComponent(currentQR)}`);
    const data = await res.json();

    if (data.status === "pending") {
      setTimeout(pollStatus, 5000);
      return;
    }

    polling = false;

    const statusEl = document.getElementById("status");
    statusEl.textContent =
      data.status === "approved"
        ? "✅ Approved — you may proceed"
        : "❌ Declined — please see staff";

    setTimeout(resetForm, 2000);

  } catch {
    setTimeout(pollStatus, 8000);
  }
}

function resetForm() {
  polling = false;
  currentQR = null;

  document.getElementById("qr").value = "";
  document.getElementById("name").value = "";
  document.getElementById("seat").value = "";
  document.getElementById("status").textContent = "";

  document.getElementById("infoPage").classList.remove("active");
  document.getElementById("qrPage").classList.add("active");
}
