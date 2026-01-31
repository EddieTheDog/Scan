let currentQR = null;

async function submitForm() {
  const qr = document.getElementById("qr").value.trim();
  const name = document.getElementById("name").value.trim();
  const seat = document.getElementById("seat").value.trim();
  const statusEl = document.getElementById("status");

  if (!qr || !name) {
    alert("QR and Name are required");
    return;
  }

  try {
    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr, name, seat })
    });

    const data = await res.json();
    if (!data.ok) {
      statusEl.textContent = "Error submitting: " + (data.error || "Unknown");
      return;
    }

    currentQR = qr;
    statusEl.textContent = "Thank you for submitting, please hold...";

    // Start polling for admin decision
    pollStatus();

  } catch (err) {
    statusEl.textContent = "Submission failed: " + err.message;
  }
}

async function pollStatus() {
  const statusEl = document.getElementById("status");

  if (!currentQR) return;

  try {
    const res = await fetch("/list");
    const data = await res.json();

    // Find current attendee
    const row = data.find(r => r.qr_value === currentQR);
    if (!row) {
      // Still pending
      setTimeout(pollStatus, 1000);
      return;
    }

    if (row.status === "approved") {
      statusEl.textContent = "✅ Approved! You may proceed.";
      resetForm();
    } else if (row.status === "declined") {
      statusEl.textContent = "❌ Declined. Please see admin.";
      resetForm();
    } else {
      // Still pending
      setTimeout(pollStatus, 1000);
    }

  } catch (err) {
    statusEl.textContent = "Hold: Technical difficulties...";
    setTimeout(pollStatus, 2000);
  }
}

function resetForm() {
  document.getElementById("qr").value = "";
  document.getElementById("name").value = "";
  document.getElementById("seat").value = "";
  currentQR = null;
}
