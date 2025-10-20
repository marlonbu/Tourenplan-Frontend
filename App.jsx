import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Marker Icon Fix für Leaflet + Vite
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  const [stopps, setStopps] = useState([]);
  const fahrerId = 1; // Standard: Christoph Arlt
  const morgen = new Date();
  morgen.setDate(morgen.getDate() + 1);
  const datum = morgen.toISOString().slice(0, 10);

  useEffect(() => {
    fetch(`https://tourenplan.onrender.com/touren/${fahrerId}/${datum}`)
      .then(res => res.json())
      .then(data => setStopps(data));
  }, [fahrerId, datum]);

  const openGoogleMaps = () => {
    if (stopps.length === 0) return;
    const origin = encodeURIComponent(stopps[0].adresse);
    const destination = encodeURIComponent(stopps[stopps.length - 1].adresse);
    const waypoints = stopps
      .slice(1, stopps.length - 1)
      .map(s => encodeURIComponent(s.adresse))
      .join("|");

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "10px" }}>
      {/* Header ohne Logo */}
      <header style={{ marginBottom: "10px", textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>🚚 Tourenplan</h1>
      </header>

      {/* Fahrer- & Tourinfos */}
      <section style={{ marginBottom: "10px", background: "#f9f9f9", padding: "10px", borderRadius: "8px" }}>
        <h2 style={{ margin: "5px 0" }}>Fahrer: Christoph Arlt</h2>
        <p style={{ margin: "5px 0" }}>
          Datum: <strong>{datum}</strong>
        </p>
        <p style={{ margin: "5px 0" }}>Stopps insgesamt: <strong>{stopps.length}</strong></p>
      </section>

      {/* Karte */}
      <MapContainer center={[52.9, 8.0]} zoom={9} style={{ height: "60vh", borderRadius: "8px" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {stopps.map((s, i) => (
          <Marker key={s.stopp_id} position={[s.lat, s.lng]}>
            <Popup>
              <b>Stopp {i + 1}</b><br />
              {s.adresse}
            </Popup>
          </Marker>
        ))}
        {stopps.length > 1 && (
          <Polyline positions={stopps.map(s => [s.lat, s.lng])} color="blue" />
        )}
      </MapContainer>

      {/* Routen-Button */}
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
