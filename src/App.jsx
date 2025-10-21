import React, { useState, useEffect } from "react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";

// Marker Icon fixen
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function App() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState("");
  const [tour, setTour] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [password, setPassword] = useState("");

  const apiUrl = "https://tourenplan.onrender.com";

  // === LOGIN ===
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Falsches Passwort");
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem("token", data.token);
    } catch (err) {
      alert("❌ Login fehlgeschlagen: " + err.message);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setFahrer([]);
    setTour([]);
    setDatum("");
    setSelectedFahrer("");
  };

  // Fahrer laden
  useEffect(() => {
    if (!token) return;
    fetch(`${apiUrl}/fahrer`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setFahrer)
      .catch((err) => console.error(err));
  }, [token]);

  // Tour laden
  const ladeTour = () => {
    if (!selectedFahrer || !datum) return;
    setLoading(true);
    fetch(`${apiUrl}/touren/${selectedFahrer}/${datum}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
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
      await fetch(`${apiUrl}/reset`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetch(`${apiUrl}/seed-demo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: function () {
          return null;
        },
        lineOptions: {
          styles: [{ color: "blue", weight: 4 }],
        },
      }).addTo(map);
    }
  }, [tour]);

  // === Login-Screen ===
  if (!token) {
    return (
      <div className="login-container">
        <h2>🔑 Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Passwort eingeben"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  // === Hauptseite ===
  return (
    <div className="App">
      <h1>🚚 Tourenplan</h1>

      <div className="controls">
        <button onClick={resetUndSeed} disabled={loading}>
          🔄 Demo neu laden
        </button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>

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
          style={{ height: "500px", width: "100%", marginTop: "20px", borderRadius: "12px" }}
        ></div>
      )}

      {/* Hinweis wenn keine Tour */}
      {tour.length === 0 && selectedFahrer && datum && (
        <p>ℹ️ Für diesen Fahrer an diesem Tag gibt es keine Tour.</p>
      )}
    </div>
  );
}

export default App;
