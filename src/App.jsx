import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";
import logo from "./assets/logo.png"; // Firmenlogo einbinden

// Standard Marker Icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function App() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(new Date().toISOString().slice(0, 10));
  const [stopps, setStopps] = useState([]);
  const [mapsLink, setMapsLink] = useState("");

  // Fahrer laden
  useEffect(() => {
    fetch("https://tourenplan.onrender.com/fahrer")
      .then((res) => res.json())
      .then(setFahrer)
      .catch(console.error);
  }, []);

  // Tourdaten + MapsLink laden
  useEffect(() => {
    if (selectedFahrer && datum) {
      fetch(`https://tourenplan.onrender.com/touren/${selectedFahrer}/${datum}`)
        .then((res) => res.json())
        .then(setStopps)
        .catch(console.error);

      fetch(
        `https://tourenplan.onrender.com/touren/${selectedFahrer}/${datum}/mapslink`
      )
        .then((res) => res.json())
        .then((data) => setMapsLink(data.mapsLink || ""))
        .catch(console.error);
    }
  }, [selectedFahrer, datum]);

  return (
    <div className="app-container">
      {/* Header mit Logo */}
      <header className="header">
        <img src={logo} alt="Firmenlogo" className="logo" />
        <h1>🚚 Tourenplan Übersicht</h1>
      </header>

      {/* Auswahlboxen */}
      <div className="controls">
        <label>Fahrer: </label>
        <select
          value={selectedFahrer}
          onChange={(e) => setSelectedFahrer(e.target.value)}
        >
          <option value="">-- Fahrer wählen --</option>
          {fahrer.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <label>Datum: </label>
        <input
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
        />
      </div>

      {stopps.length > 0 && (
        <>
          {/* Karte */}
          <MapContainer
            center={[stopps[0].lat || 52.52, stopps[0].lng || 13.405]}
            zoom={10}
            style={{ height: "400px", width: "100%", marginBottom: "20px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {stopps.map((s, i) => (
              <Marker key={i} position={[s.lat, s.lng]}>
                <Popup>
                  <b>Stopp {i + 1}</b>
                  <br />
                  {s.adresse}
                </Popup>
              </Marker>
            ))}
            <Polyline positions={stopps.map((s) => [s.lat, s.lng])} color="blue" />
          </MapContainer>

          {/* Tabelle */}
          <h2>Tourdaten</h2>
          <table className="tour-table">
            <thead>
              <tr>
                <th>Ankunftszeit</th>
                <th>Kunde</th>
                <th>Kommission</th>
                <th>Kundenadresse</th>
                <th>Anmerkung</th>
              </tr>
            </thead>
            <tbody>
              {stopps.map((s, i) => (
                <tr key={i}>
                  <td>{`${8 + i}:00`}</td>
                  <td>{`Kunde ${i + 1}`}</td>
                  <td>{`KOM-${100 + i}`}</td>
                  <td>{s.adresse}</td>
                  <td>{`Anmerkung ${i + 1}`}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Button → Google Maps */}
          {mapsLink && (
            <div className="maps-btn">
              <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                ➡️ Route in Google Maps öffnen
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
