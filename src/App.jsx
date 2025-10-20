import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const App = () => {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(new Date().toISOString().slice(0, 10));
  const [tour, setTour] = useState([]);

  useEffect(() => {
    fetch("https://tourenplan.onrender.com/fahrer")
      .then((res) => res.json())
      .then((data) => setFahrer(data))
      .catch((err) => console.error(err));
  }, []);

  const ladeTour = () => {
    if (!selectedFahrer || !datum) return;
    fetch(`https://tourenplan.onrender.com/touren/${selectedFahrer}/${datum}`)
      .then((res) => res.json())
      .then((data) => setTour(data))
      .catch((err) => console.error(err));
  };

  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const polylinePositions = tour.map((s) => [s.lat, s.lng]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <h1 style={{ textAlign: "center" }}>🚚 Tourenplan Übersicht</h1>

      {/* Auswahlboxen */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", gap: "10px" }}>
        <select
          value={selectedFahrer}
          onChange={(e) => setSelectedFahrer(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="">-- Fahrer wählen --</option>
          {fahrer.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
          style={{ padding: "5px" }}
        />

        <button onClick={ladeTour} style={{ padding: "5px 10px", cursor: "pointer" }}>
          Tour laden
        </button>
      </div>

      {/* Tabelle */}
      {tour.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>#</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Ankunftszeit</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Kunde</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Kommission</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Adresse</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Anmerkung</th>
            </tr>
          </thead>
          <tbody>
            {tour.map((s, idx) => (
              <tr key={s.stopp_id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{idx + 1}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{s.ankunftszeit}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{s.kunde}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{s.kommission}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{s.adresse}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{s.anmerkung}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Karte */}
      {tour.length > 0 && (
        <div style={{ height: "500px", width: "100%" }}>
          <MapContainer
            center={[tour[0].lat, tour[0].lng]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {tour.map((s, idx) => (
              <Marker key={s.stopp_id} position={[s.lat, s.lng]} icon={markerIcon}>
                <Popup>
                  <b>Stopp {idx + 1}</b>
                  <br />
                  {s.kunde} ({s.kommission})
                  <br />
                  {s.adresse}
                  <br />
                  Ankunft: {s.ankunftszeit}
                  <br />
                  <i>{s.anmerkung}</i>
                </Popup>
              </Marker>
            ))}
            <Polyline positions={polylinePositions} color="blue" />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default App;
