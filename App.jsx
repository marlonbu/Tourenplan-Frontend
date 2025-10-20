import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Marker Fix
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

function App() {
  const [stopps, setStopps] = useState([]);
  const [fahrerId, setFahrerId] = useState(1);
  const [fahrer, setFahrer] = useState([]);
  const morgen = new Date();
  morgen.setDate(morgen.getDate() + 1);
  const datum = morgen.toISOString().slice(0, 10);

  useEffect(() => {
    fetch("https://tourenplan.onrender.com/fahrer")
      .then(res => res.json())
      .then(data => setFahrer(data));
  }, []);

  useEffect(() => {
    if (!fahrerId) return;
    fetch(`https://tourenplan.onrender.com/touren/${fahrerId}/${datum}`)
      .then(res => res.json())
      .then(data => setStopps(data));
  }, [fahrerId, datum]);

  const openGoogleMaps = () => {
    if (stopps.length === 0) return;
    const origin = encodeURIComponent(stopps[0].adresse);
    const destination = encodeURIComponent(stopps[stopps.length - 1].adresse);
    const waypoints = stopps.slice(1, stopps.length - 1).map(s => encodeURIComponent(s.adresse)).join("|");
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`, "_blank");
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "10px" }}>
      <header style={{ marginBottom: "10px", textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>🚚 Tourenplan</h1>
      </header>

      {/* Fahrer-Auswahl */}
      <div style={{ marginBottom: "10px", textAlign: "center" }}>
        <label style={{ marginRight: "10px" }}>Fahrer wählen:</label>
        <select value={fahrerId} onChange={(e) => setFahrerId(e.target.value)}>
          {fahrer.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Tourdaten Übersicht */}
      <section style={{ marginBottom: "10px", background: "#f9f9f9", padding: "10px", borderRadius: "8px" }}>
        <h2 style={{ margin: "5px 0" }}>Tourdaten</h2>
        <p>Datum: <strong>{datum}</strong></p>
        <p>Stopps insgesamt: <strong>{stopps.length}</strong></p>
        {/* Tabelle */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead style={{ background: "#ddd" }}>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "6px" }}>Ankunftszeit</th>
              <th style={{ border: "1px solid #ccc", padding: "6px" }}>Kunde</th>
              <th style={{ border: "1px solid #ccc", padding: "6px" }}>Kommission</th>
              <th style={{ border: "1px solid #ccc", padding: "6px" }}>Adresse</th>
              <th style={{ border: "1px solid #ccc", padding: "6px" }}>Anmerkung</th>
            </tr>
          </thead>
          <tbody>
            {stopps.map((s, i) => (
              <tr key={s.stopp_id}>
                <td style={{ border: "1px solid #ccc", padding: "6px" }}>{s.ankunftszeit || "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: "6px" }}>{s.kunde || "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: "6px" }}>{s.kommission || "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: "6px" }}>{s.adresse}</td>
                <td style={{ border: "1px solid #ccc", padding: "6px" }}>{s.anmerkung || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Karte */}
      <MapContainer center={[52.9, 8.0]} zoom={9} style={{ height: "50vh", borderRadius: "8px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        {stopps.map((s, i) => (
          <Marker key={s.stopp_id} position={[s.lat, s.lng]}>
            <Popup><b>Stopp {i + 1}</b><br />{s.adresse}</Popup>
          </Marker>
        ))}
        {stopps.length > 1 && <Polyline positions={stopps.map(s => [s.lat, s.lng])} color="blue" />}
      </MapContainer>

      {/* Button */}
      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <button
          onClick={openGoogleMaps}
          style={{
            padding: "12px 20px",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            background: "#007BFF",
            color: "white",
            cursor: "pointer"
          }}
        >
          📍 Route in Google Maps öffnen
        </button>
      </div>
    </div>
  );
}

export default App;
