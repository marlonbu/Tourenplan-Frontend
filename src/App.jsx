import { useState, useEffect } from "react";
import "./App.css";
import MapView from "./components/MapView";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(new Date().toISOString().split("T")[0]);
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const [message, setMessage] = useState(""); // ✅ Neue Erfolgsmeldung

  // ---------------------------------------------------------
  // Login-Funktion
  // ---------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    const res = await fetch("https://tourenplan.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert("Login fehlgeschlagen");
    }
  };

  // ---------------------------------------------------------
  // Fahrer laden
  // ---------------------------------------------------------
  useEffect(() => {
    if (!token) return;
    fetch("https://tourenplan.onrender.com/fahrer", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFahrer(data))
      .catch((err) => console.error("Fehler beim Laden der Fahrer:", err));
  }, [token]);

  // ---------------------------------------------------------
  // Tourdaten laden
  // ---------------------------------------------------------
  const ladeTour = async () => {
    if (!selectedFahrer || !datum) return;
    try {
      const res = await fetch(
        `https://tourenplan.onrender.com/touren/${selectedFahrer}/${datum}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setTour(data.tour);
      setStopps(data.stopps || []);
    } catch (err) {
      console.error("Fehler beim Laden der Tour:", err);
    }
  };

  useEffect(() => {
    if (selectedFahrer && datum) ladeTour();
  }, [selectedFahrer, datum]);

  // ---------------------------------------------------------
  // Demo neu laden
  // ---------------------------------------------------------
  const demoNeuLaden = async () => {
    try {
      await fetch("https://tourenplan.onrender.com/reset", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetch("https://tourenplan.onrender.com/seed-demo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Demo erfolgreich aktualisiert");
      setTimeout(() => setMessage(""), 3000); // Nachricht nach 3s ausblenden
      ladeTour();
    } catch (err) {
      console.error("Fehler beim Neuladen der Demo:", err);
    }
  };

  // ---------------------------------------------------------
  // Karte in Google Maps öffnen
  // ---------------------------------------------------------
  const openInGoogleMaps = () => {
    const addresses = stopps.map((s) => s.adresse).join("/");
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(
      "Fehnstraße 3, 49699 Lindern"
    )}/${encodeURIComponent(addresses)}`;
    window.open(url, "_blank");
  };

  // ---------------------------------------------------------
  // Logout nach 60 Minuten Inaktivität
  // ---------------------------------------------------------
  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      localStorage.removeItem("token");
      setToken("");
      alert("Sitzung abgelaufen – bitte neu einloggen.");
    }, 60 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [token]);

  // ---------------------------------------------------------
  // Render Login oder App
  // ---------------------------------------------------------
  if (!token) {
    return (
      <div className="login-container">
        <h2>Tourenplan Login</h2>
        <form onSubmit={handleLogin}>
          <input type="text" name="username" placeholder="Benutzername" required />
          <input type="password" name="password" placeholder="Passwort" required />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>🚚 Tourenplan</h1>

      <div className="controls">
        <select
          value={selectedFahrer}
          onChange={(e) => setSelectedFahrer(e.target.value)}
        >
          <option value="">Fahrer wählen...</option>
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

        <button onClick={ladeTour}>Tour laden</button>
        <button onClick={demoNeuLaden}>🔄 Demo neu laden</button>

        {/* ✅ Erfolgsmeldung direkt unter dem Button */}
        {message && <p className="success-message">{message}</p>}

        <button onClick={openInGoogleMaps}>🧭 Tour in Google Maps öffnen</button>

        <button onClick={() => setShowMap(!showMap)}>
          {showMap ? "🗺️ Karte ausblenden" : "🗺️ Karte anzeigen"}
        </button>
      </div>

      {stopps.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Kunde</th>
              <th>Adresse</th>
              <th>Kommission</th>
              <th>Telefon</th>
              <th>Hinweis</th>
              <th>Status</th>
              <th>Foto</th>
            </tr>
          </thead>
          <tbody>
            {stopps.map((s) => (
              <tr key={s.id}>
                <td>{s.kunde}</td>
                <td>{s.adresse}</td>
                <td>{s.kommission}</td>
                <td>
                  {s.telefon ? (
                    <a href={`tel:${s.telefon}`}>{s.telefon}</a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{s.hinweis}</td>
                <td>{s.status}</td>
                <td>📷</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Keine Tourdaten verfügbar</p>
      )}

      {showMap && <MapView stops={stopps} />}
    </div>
  );
}

export default App;
