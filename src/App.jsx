import React, { useState, useEffect } from "react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";

// Fix für Marker-Icons in Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState("");
  const [tour, setTour] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = "https://tourenplan.onrender.com";

  // Fahrer laden
  useEffect(() => {
    fetch(`${apiUrl}/fahrer`)
      .then((res) => res.json())
      .then(setFahrer)
      .catch((err) => console.error(err));
  }, []);

  // Tour laden
  const ladeTour = () => {
    if (!selectedFahrer || !datum) return;
    setLoading(true);
    fetch(`${apiUrl}/touren/${selectedFahrer}/${datum}`)
      .then((res) => res.json())
      .then((data) => {
        setTour(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // 🚀 Demo neu laden (reset + seed)
  const resetUndSeed = async () => {
    try {
      setLoading(true);
      await fetch(`${apiUrl}/reset`);
      await fetch(`${apiUrl}/seed-demo`);
      alert("✅ Demo-Daten wurden neu erstellt!");
      setTour([]);
      setSelectedFahrer("");
      setDatum("");
    } catch (err) {
      console.error("Fehler beim Reset/Seed:", err);
      alert("❌ Fehler beim Demo-Neuladen");
    } finally {
      setLoading(false);
    }
  };

  // Routing in Karte einbauen
  useEffect(() => {
    if (tour.length > 1) {
      const map = L.map("map", {
        center: [tour[0].lat, tour[0].lng],
        zoom: 10,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a>',
      }).addTo(map);

      tour.forEach((stopp) => {
        L.marker([stopp.lat, stopp.lng])
          .addTo(map)
          .bindPopup(stopp.adresse);
      });

      L.Routing.control({
        waypoints: tour.map((s) => L.latLng(s.lat, s.lng)),
        routeWhileDragging: false,
        show: false, // 🚀 entfernt die Sidebar mit Beschreibung
      }).addTo(map);
    }
  }, [tour]);

  return (
    <div className="App">
      <h1>🚚 Tourenplan</h1>

      {/* Reset Button */}
      <div className="controls">
        <button onClick={resetUndSeed} disabled={loading}>
          🔄 Demo neu laden
        </button>
      </div>

      {/* Fahrer Auswahl */}
      <div className="controls">
        <select
          value={selectedFahrer}
          onChange={(e) => setSelectedFahrer(e.target.value)}
        >
          <option value="">Fahrer auswählen</option>
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
        />
        <button onClick={ladeTour} disabled={loading}>
          Laden
        </button>
      </div>

      {/* Tabelle */}
      {tour.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Ankunftszeit</th>
              <th>Kunde</th>
              <th>Kommission</th>
              <th>Adresse</th>
              <th>Anmerkung</th>
            </tr>
          </thead>
          <tbody>
            {tour.map((stopp, i) => (
              <tr key={i}>
                <td>{stopp.ankunftszeit || "08:00"}</td>
                <td>{stopp.kunde || `Kunde ${i + 1}`}</td>
                <td>{stopp.kommission || `KOM-${1000 + i}`}</td>
                <td>{stopp.adresse}</td>
                <td>{stopp.anmerkung || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Karte */}
      {tour.length > 0 && (
        <div
          id="map"
          style={{
            height: "500px",
            width: "100%",
            marginTop: "20px",
            borderRadius: "10px",
          }}
        ></div>
      )}
    </div>
  );
}

export default App;
