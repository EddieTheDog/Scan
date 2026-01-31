let currentQR = null;

// Move to Info Page
function goToInfo() {
  const qrInput = document.getElementById("qr").value.trim();
  if (!qrInput) {
    alert("Please enter QR code");
    return;
  }
  currentQR = qrInput;
  document.getElementById("qrPage").classList.remove("active");
  document.getElementById("infoPage").classList.add("active");
}

// Submit info
async function submitForm() {
  const name = document.getElementById("name").value.trim();
  const seat = document.getElementById("seat").value.trim();
  const statusEl = document.getElementById("status");

  if (!name) {
    alert("Name is required");
    return;
  }

  statusEl.textContent = "Awaiting approval, please wait...";

  try {
    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr: currentQR, name, seat })
    });

    const data = await res.json();
    if (!data.ok) {
      statusEl.textContent = "Error submitting: " + (data.error || "Unknown");
      return;
    }

    // Start polling for admin decision
    pollStatus();

  } catch (err) {
    statusEl.textContent = "Submission failed: " + err.message;
  }
}

// Poll D1 for admin decision
async function pollStatus() {
  const statusEl = document.getElementById("status");

  if (!currentQR) return;

  try {
    const res = await fetch("/list");
    const data = await res.json();

    const row = data.find(r => r.qr_value === currentQR);
    if (!row || row.status === "pending") {
      // still waiting
      setTimeout(pollStatus, 1000);
      return;
    }

    if (row.status === "approved") {
      statusEl.textContent = "✅ Approved! You may proceed.";
    } else if (row.status === "declined") {
      statusEl.textContent = "❌ Declined. Please see admin.";
    }

    // Flash for 2 seconds, then reset to QR page
    setTimeout(resetForm, 2000);

  } catch (err) {
    statusEl.textContent = "Hold: Technical difficulties...";
    setTimeout(pollStatus, 2000);
  }
}

// Reset form for next attendee
function resetForm() {
  currentQR = null;
  document.getElementById("qr").value = "";
  document.getElementById("name").value = "";
  document.getElementById("seat").value = "";
  document.getElementById("status").textContent = "";

  document.getElementById("infoPage").classList.remove("active");
  document.getElementById("qrPage").classList.add("active");
}
