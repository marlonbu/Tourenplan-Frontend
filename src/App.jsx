import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import WeekView from "./components/WeekView";
import MapView from "./components/MapView";

const API_URL = "https://tourenplan.onrender.com";
const START_ADDRESS = "Hans Gehlenborg GmbH, Fehnstraße 3, 49699 Lindern";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState("wochen");
  const [tourData, setTourData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true); // Karte standardmäßig sichtbar

  const isLoggedIn = !!token;

  // Referenzen für Kamera-Inputs
  const fileInputsRef = useRef({});
  // Auto-Logout
  const logoutTimerRef = useRef(null);
  const INACTIVITY_LIMIT_MS = 60 * 60 * 1000;

  // Auto-Logout bei Inaktivität
  useEffect(() => {
    if (!isLoggedIn) return;
    const resetTimer = () => {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = setTimeout(() => handleLogout(true), INACTIVITY_LIMIT_MS);
    };
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(logoutTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [isLoggedIn]);

  // Token laden
  useEffect(() => {
    const t = localStorage.getItem("tourenplan_token");
    if (t) setToken(t);
  }, []);

  // Fahrer laden
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`${API_URL}/fahrer`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setFahrer(data);
        if (data.length > 0 && !selectedFahrer) setSelectedFahrer(String(data[0].id));
      })
      .catch((err) => console.error(err));
  }, [isLoggedIn]);

  // Tagestour laden
  const ladeTagestour = async () => {
    if (!selectedFahrer || !datum) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/touren/${selectedFahrer}/${datum}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTourData(data.stopps || []);
    } catch (e) {
      console.error(e);
      alert("Fehler beim Laden der Tourdaten");
    } finally {
      setLoading(false);
    }
  };

  // Login / Logout
  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Login fehlgeschlagen");
      const data = await res.json();
      localStorage.setItem("tourenplan_token", data.token);
      setToken(data.token);
    } catch {
      alert("❌ Login fehlgeschlagen");
    }
  };

  const handleLogout = (auto = false) => {
    localStorage.removeItem("tourenplan_token");
    setToken("");
    setFahrer([]);
    setSelectedFahrer("");
    setTourData([]);
    clearTimeout(logoutTimerRef.current);
    if (auto) alert("🔒 Sitzung abgelaufen – bitte neu anmelden.");
  };

  // Foto-Upload
  const openCameraForStopp = (stoppId) => {
    const input = fileInputsRef.current[stoppId];
    if (input) input.click();
  };

  const handlePhotoSelected = async (stoppId, file) => {
    if (!file) return;
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`${API_URL}/upload-photo/${stoppId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error("Upload fehlgeschlagen");
      await res.json();
      alert("📷 Foto gespeichert");
    } catch (e) {
      console.error(e);
      alert("Foto-Upload fehlgeschlagen.");
    }
  };

  // Google-Maps-URL mit Textadressen (Start + Stopps)
  const googleMapsRouteUrl = () => {
    if (!tourData?.length) return null;
    const parts = [
      START_ADDRESS,
      ...tourData.map((s) => s.adresse),
    ].map((a) => encodeURIComponent(a));
    return `https://www.google.com/maps/dir/${parts.join("/")}`;
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="login-container">
          <h2>🔑 Login</h2>
          <input
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <h1>🚚 Tourenplan</h1>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={activeTab === "wochen" ? "active" : ""}
              onClick={() => setActiveTab("wochen")}
            >
              Wochenübersicht
            </button>
            <button
              className={activeTab === "tagestour" ? "active" : ""}
              onClick={() => setActiveTab("tagestour")}
            >
              Tagestour
            </button>
            <button className="logout" onClick={() => handleLogout(false)}>
              Logout
            </button>
          </div>

          {activeTab === "tagestour" && (
            <>
              <div className="controls">
                <select
                  value={selectedFahrer}
                  onChange={(e) => setSelectedFahrer(e.target.value)}
                >
                  <option value="">Fahrer wählen</option>
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
                <button onClick={ladeTagestour}>
                  {loading ? "Laden..." : "Tour laden"}
                </button>
              </div>

              {tourData.length > 0 && (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>Kunde</th>
                        <th>Adresse</th>
                        <th>Telefon</th>
                        <th>Hinweis</th>
                        <th>Status</th>
                        <th>Foto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tourData.map((s) => (
                        <tr key={s.id}>
                          <td>{s.kunde}</td>
                          <td>{s.adresse}</td>
                          <td>
                            {s.telefon ? (
                              <a href={`tel:${String(s.telefon).replace(/[^\d+]/g, "")}`}>
                                {s.telefon}
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{s.hinweis || "-"}</td>
                          <td>{s.status || "-"}</td>
                          <td>
                            <input
                              ref={(el) => (fileInputsRef.current[s.id] = el)}
                              type="file"
                              accept="image/*"
                              capture="environment"
                              style={{ display: "none" }}
                              onChange={(e) => handlePhotoSelected(s.id, e.target.files?.[0])}
                            />
                            <button
                              type="button"
                              className="photo-btn"
                              title="Foto aufnehmen"
                              onClick={() => openCameraForStopp(s.id)}
                            >
                              📷
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Karten-Buttons */}
                  <div className="map-actions">
                    <button className="btn" onClick={() => setShowMap((v) => !v)}>
                      {showMap ? "🗺️ Karte ausblenden" : "🗺️ Karte anzeigen"}
                    </button>
                    {googleMapsRouteUrl() && (
                      <a
                        className="btn"
                        href={googleMapsRouteUrl()}
                        target="_blank"
                        rel="noreferrer"
                      >
                        🧭 Tour in Google Maps öffnen
                      </a>
                    )}
                  </div>

                  {/* Karte */}
                  <MapView
                    startAddress={START_ADDRESS}
                    stops={tourData}
                    visible={showMap}
                  />
                </>
              )}

              {tourData.length === 0 && !loading && (
                <p className="muted">Keine Stopps geladen. Bitte Fahrer & Datum wählen und „Tour laden“ klicken.</p>
              )}
            </>
          )}

          {activeTab === "wochen" && (
            <WeekView
              apiUrl={API_URL}
              token={token}
              fahrer={fahrer}
              selectedFahrer={selectedFahrer}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
