import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Routing-Komponente
function RoutingMachine({ waypoints }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const validWaypoints = waypoints.filter(
      (w) =>
        w.lat !== null &&
        w.lng !== null &&
        !isNaN(w.lat) &&
        !isNaN(w.lng)
    );
    if (validWaypoints.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: validWaypoints.map((w) => L.latLng(w.lat, w.lng)),
      lineOptions: { styles: [{ color: "#0077ff", weight: 5 }] },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, waypoints]);

  return null;
}

function App() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [tourdaten, setTourdaten] = useState([]);
  const [datum, setDatum] = useState("");

  // Fahrer laden
  useEffect(() => {
    fetch("https://tourenplan.onrender.com/fahrer")
      .then((res) => res.json())
      .then((data) => setFahrer(data))
      .catch((err) => console.error(err));
  }, []);

  // Tour laden
  const ladeTour = () => {
    if (!selectedFahrer || !datum) return;
    fetch(`https://tourenplan.onrender.com/touren/${selectedFahrer}/${datum}`)
      .then((res) => res.json())
      .then((data) => setTourdaten(data))
      .catch((err) => console.error(err));
  };

  // Erledigt setzen
  const setErledigt = async (stoppId) => {
    try {
      await fetch("https://tourenplan.onrender.com/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stopp_id: stoppId }),
      });
      ladeTour(); // neu laden nach Update
    } catch (err) {
      console.error("Fehler beim Setzen von erledigt:", err);
    }
  };

  // Google Maps Button
  const openInGoogleMaps = () => {
    if (tourdaten.length === 0) return;
    const valid = tourdaten.filter(
      (s) =>
        s.lat !== null &&
        s.lng !== null &&
        !isNaN(s.lat) &&
        !isNaN(s.lng)
    );
    if (valid.length === 0) return;
    const base = "https://www.google.com/maps/dir/";
    const coords = valid.map((s) => `${s.lat},${s.lng}`).join("/");
    window.open(base + coords, "_blank");
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>🚚 Tourenplan</h1>

      {/* Fahrer Auswahl */}
      <div style={{ marginBottom: "15px" }}>
        <label>Fahrer: </label>
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
      </div>

      {/* Datum Auswahl */}
      <div style={{ marginBottom: "15px" }}>
        <label>Datum: </label>
        <input
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
        />
        <button
          onClick={ladeTour}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            background: "#0077ff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Laden
        </button>
      </div>

      {/* Tabelle */}
      {tourdaten.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Reihenfolge
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Adresse
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Erledigt
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Aktion
              </th>
            </tr>
          </thead>
          <tbody>
            {tourdaten.map((stopp, idx) => (
              <tr
                key={stopp.stopp_id}
                style={{ background: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}
              >
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {stopp.reihenfolge}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {stopp.adresse}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {stopp.erledigt ? "✅" : "❌"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {!stopp.erledigt && (
                    <button
                      onClick={() => setErledigt(stopp.stopp_id)}
                      style={{
                        padding: "5px 10px",
                        background: "#28a745",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Erledigt setzen
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Google Maps Button */}
      {tourdaten.length > 0 && (
        <button
          onClick={openInGoogleMaps}
          style={{
            padding: "10px 15px",
            background: "#34A853",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          ➡️ Route in Google Maps öffnen
        </button>
      )}

      {/* Karte */}
      {tourdaten.length > 0 && (
        <MapContainer
          center={[tourdaten[0].lat, tourdaten[0].lng]}
          zoom={10}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {tourdaten
            .filter((s) => s.lat && s.lng)
            .map((stopp) => (
              <Marker key={stopp.stopp_id} position={[stopp.lat, stopp.lng]}>
                <Popup>
                  {stopp.adresse} <br />
                  {stopp.erledigt ? "✅ erledigt" : "❌ offen"}
                </Popup>
              </Marker>
            ))}
          <RoutingMachine waypoints={tourdaten} />
        </MapContainer>
      )}
    </div>
  );
}

export default App;
