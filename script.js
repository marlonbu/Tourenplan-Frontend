async function ladeTouren() {
  const container = document.getElementById("touren-container");
  try {
    const res = await fetch("https://tourenplan.onrender.com/touren"); 
    const touren = await res.json();

    container.innerHTML = "";
    if (touren.length === 0) {
      container.innerHTML = "<p>Keine Touren gefunden.</p>";
      return;
    }

    touren.forEach(tour => {
      const div = document.createElement("div");
      div.className = "tour";
      div.innerHTML = `
        <h3>Tour #${tour.tour_id} – ${tour.status}</h3>
        <p><b>Datum:</b> ${tour.datum}</p>
        <p><b>Fahrer-ID:</b> ${tour.fahrer_id}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = "<p>Fehler beim Laden der Touren.</p>";
    console.error(err);
  }
}

ladeTouren();
