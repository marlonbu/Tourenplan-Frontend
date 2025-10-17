let map;

function initMap() {
  // Karte initialisieren (Mittelpunkt: Deutschland)
  map = L.map('map').setView([51.1657, 10.4515], 6);

  // OpenStreetMap Tiles laden
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  ladeTouren();
}

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

      // Falls Koordinaten in der Tour vorhanden sind → Marker setzen
      if (tour.latitude && tour.longitude) {
        L.marker([tour.latitude, tour.longitude])
          .addTo(map)
          .bindPopup(`<b>Tour #${tour.tour_id}</b><br>Status: ${tour.status}`);
      }
    });
  } catch (err) {
    container.innerHTML = "<p>Fehler beim Laden der Touren.</p>";
    console.error(err);
  }
}

initMap();
