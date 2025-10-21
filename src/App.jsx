import React, { useState, useEffect } from "react";
import "./App.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState("");
  const [tour, setTour] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [view, setView] = useState("day");
  const [loading, setLoading] = useState(false);
  const [meldung, setMeldung] = useState("");

  const apiUrl = "https://tourenplan.onrender.com";

  // Login Funktion
  const handleLogin = async () => {
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setIsLoggedIn(true);
      } else {
        alert("❌ Falsches Passwort");
      }
    } catch (err) {
      console.error("Login-Fehler:", err);
    }
  };

  // Helper für API Calls mit Token
  const fetchWithAuth = (url) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  // Fahrer laden
  useEffect(() => {
    if (isLoggedIn) {
      fetchWithAuth(`${apiUrl}/fahrer`)
        .then((res) => res.json())
        .then(setFahrer)
        .catch((err) => console.error(err));
    }
  }, [isLoggedIn]);

  // Tagesansicht laden
  const ladeTour = () => {
    if (!selectedFahrer || !datum) return;
    setLoading(true);
    setMeldung("");
    fetchWithAuth(`${apiUrl}/touren/${selectedFahrer}/${datum}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) setMeldung("⚠️ Keine Tour gefunden.");
        setTour(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Wochenübersicht laden
  const ladeWoche = () => {
    if (!selectedFahrer || !datum) return;
    setLoading(true);
    fetchWithAuth(`${apiUrl}/touren/woche/${selectedFahrer}/${datum}`)
      .then((res) => res.json())
      .then((data) => setWeekData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Karte zeichnen
  useEffect(() => {
    if (view === "day" && tour.length > 1) {
      const map = L.map("map", { center: [tour[0].lat, tour[0].lng], zoom: 10 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a>',
      }).addTo(map);

      tour.forEach((stopp) => L.marker([stopp.lat, stopp.lng]).addTo(map).bindPopup(stopp.adresse));

      L.Routing.control({
        waypoints: tour.map((s) => L.latLng(s.lat, s.lng)),
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: "red", weight: 4 }] },
      })
        .on("routeselected", () => {
          const c = document.querySelector(".leaflet-routing-container");
          if (c) c.style.display = "none";
        })
        .addTo(map);

      return () => map.remove();
    }
  }, [tour, view]);

  // 🚪 Login Screen
  if (!isLoggedIn) {
    return (
      <div className="App">
        <h1>🔑 Login</h1>
        <input
          type="password"
          placeholder="Passwort eingeben"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  // ✅ Wenn eingeloggt → App
  return (
    <div className="App">
      <h1>🚚 Tourenplan</h1>

      <div className="tabs">
        <button onClick={() => setView("day")} disabled={view === "day"}>📅 Tagesansicht</button>
        <button onClick={() => setView("week")} disabled={view === "week"}>🗓️ Wochenübersicht</button>
      </div>

      <div className="controls">
        <select value={selectedFahrer} onChange={(e) => setSelectedFahrer(e.target.value)}>
          <option value="">Fahrer auswählen</option>
          {fahrer.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
        {view === "day" && <button onClick={ladeTour} disabled={loading}>Tagesansicht laden</button>}
        {view === "week" && <button onClick={ladeWoche} disabled={loading}>Wochenübersicht laden</button>}
      </div>

      {view === "day" && (
        <>
          {meldung && <div style={{ color: "red", fontWeight: "bold" }}>{meldung}</div>}
          {tour.length > 0 && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Adresse</th>
                    <th>Telefon</th>
                    <th>Hinweis</th>
                    <th>Status</th>
                    <th>Erledigt</th>
                  </tr>
                </thead>
                <tbody>
                  {tour.map((s, i) => (
                    <tr key={s.stopp_id}>
                      <td>{s.adresse}</td>
                      <td>{s.telefon ? <a href={`tel:${s.telefon}`}>{s.telefon}</a> : "-"}</td>
                      <td>{s.hinweis || "-"}</td>
                      <td>{s.status_text || "-"}</td>
                      <td>{s.erledigt ? "✅" : "❌"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div id="map" style={{ height: "400px", marginTop: 20, borderRadius: 12 }} />
            </>
          )}
        </>
      )}

      {view === "week" && (
        <>
          {weekData.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Fahrer</th>
                  <th>Adresse</th>
                </tr>
              </thead>
              <tbody>
                {weekData.map((w, i) => (
                  <tr key={i}>
                    <td>{new Date(w.datum).toLocaleDateString()}</td>
                    <td>{w.fahrer_name}</td>
                    <td>{w.adresse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default App;
