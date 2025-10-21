import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";

function App() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState("");
  const [tour, setTour] = useState([]);

  useEffect(() => {
    fetch("https://tourenplan.onrender.com/fahrer")
      .then((res) => res.json())
      .then((data) => setFahrer(data))
      .catch((err) => console.error("Fehler beim Laden der Fahrer:", err));
  }, []);

  const ladeTour = () => {
    if (!selectedFahrer || !datum) {
      alert("Bitte Fahrer und Datum auswählen!");
      return;
    }

    fetch(`https://tourenplan.onrender.com/touren/${selectedFahrer}/${datum}`)
      .then((res) => res.json())
      .then((data) => setTour(data))
      .catch((err) => console.error("Fehler beim Laden der Tour:", err));
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    let [hour, minute] = timeString.split(":");
    hour = hour.padStart(2, "0");
    minute = minute.padStart(2, "0");
    return `${hour}:${minute}`;
  };

  const defaultPosition = [52.85, 8.05];

  // Routing hinzufügen sobald Tour da ist
  useEffect(() => {
    if (tour.length > 1) {
      const map = window._mapInstance;
      if (!map) return;

      // Entfernt alte Routen
      if (map._routingControl) {
        map.removeControl(map._routingControl);
      }

      const waypoints = tour.map((stopp) => L.latLng(stopp.lat, stopp.lng));

      const routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: function (i, wp, nWps) {
          return L.marker(wp.latLng).bindPopup(
            `<b>${tour[i].kunde || "Unbekannt"}</b><br/>${tour[i].adresse}`
          );
        },
      }).addTo(map);

      map._routingControl = routingControl;
    }
  }, [tour]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🚚 Tourenplan</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Fahrer:&nbsp;
          <select
            value={selectedFahrer}
            onChange={(e) => setSelectedFahrer(e.target.value)}
          >
            <option value="">-- bitte wählen --</option>
            {fahrer.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>

        &nbsp;&nbsp;

        <label>
          Datum:&nbsp;
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
          />
        </label>

        &nbsp;&nbsp;

        <button onClick={ladeTour}>Tour laden</button>
      </div>

      {/* Tabelle */}
      <h2>Tourübersicht</h2>
      {tour.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            marginBottom: "30px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={thStyle}>Reihenfolge</th>
              <th style={thStyle}>Ankunftszeit</th>
              <th style={thStyle}>Kunde</th>
              <th style={thStyle}>Kommission</th>
              <th style={thStyle}>Adresse</th>
              <th style={thStyle}>Anmerkung</th>
              <th style={thStyle}>Erledigt</th>
            </tr>
          </thead>
          <tbody>
            {tour.map((stopp, index) => (
              <tr
                key={stopp.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                }}
              >
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{formatTime(stopp.ankunftszeit)}</td>
                <td style={tdStyle}>{stopp.kunde || "-"}</td>
                <td style={tdStyle}>{stopp.kommission || "-"}</td>
                <td style={tdStyle}>{stopp.adresse || "-"}</td>
                <td style={tdStyle}>{stopp.anmerkung || "-"}</td>
                <td style={tdStyle}>{stopp.erledigt ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Keine Tourdaten gefunden.</p>
      )}

      {/* Karte */}
      {tour.length > 0 && (
        <MapContainer
          whenCreated={(mapInstance) => (window._mapInstance = mapInstance)}
          center={tour[0]?.lat && tour[0]?.lng ? [tour[0].lat, tour[0].lng] : defaultPosition}
          zoom={10}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          />
        </MapContainer>
      )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f4f4f4",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default App;
