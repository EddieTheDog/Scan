async function submitForm() {
  const qr = document.getElementById("qr").value;
  const name = document.getElementById("name").value;
  const seat = document.getElementById("seat").value;

  if (!qr || !name) {
    alert("QR and Name required");
    return;
  }

  await fetch("/submit", {
    method: "POST",
    body: JSON.stringify({ qr, name, seat })
  });

  document.getElementById("qr").value = "";
  document.getElementById("name").value = "";
  document.getElementById("seat").value = "";

  alert("Saved. Send them forward.");
}
