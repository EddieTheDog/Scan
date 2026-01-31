async function submitForm() {
  const qr = document.getElementById("qr").value.trim();
  const name = document.getElementById("name").value.trim();
  const seat = document.getElementById("seat").value.trim();

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
      alert("Error: " + (data.error || "Unknown error"));
      return;
    }

    // Clear fields
    document.getElementById("qr").value = "";
    document.getElementById("name").value = "";
    document.getElementById("seat").value = "";

    alert("Saved successfully. They can proceed.");

  } catch (err) {
    alert("Failed to submit: " + err.message);
  }
}
