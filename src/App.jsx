import React, { useState, useEffect } from "react";
import "./App.css";
import WeekView from "./components/WeekView";

const API_URL = "https://tourenplan.onrender.com";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState("wochen"); // Wochenübersicht zuerst aktiv
  const [tourData, setTourData] = useState([]);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!token;

  // 🔑 Token aus localStorage laden
  useEffect(() => {
    const t = localStorage.getItem("tourenplan_token");
    if (t) setToken(t);
  }, []);

  // 🚚 Fahrer laden
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

  // 📅 Tagestour laden
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

  // 🔓 Login
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

  const handleLogout = () => {
    localStorage.removeItem("tourenplan_token");
    setToken("");
    setFahrer([]);
    setSelectedFahrer("");
    setTourData([]);
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

          {/* Tabs getauscht */}
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
            <button className="logout" onClick={handleLogout}>
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
                <table>
                  <thead>
                    <tr>
                      <th>Kunde</th>
                      <th>Adresse</th>
                      <th>Telefon</th>
                      <th>Hinweis</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tourData.map((s, i) => (
                      <tr key={i}>
                        <td>{s.kunde}</td>
                        <td>{s.adresse}</td>
                        <td>
                          {s.telefon ? (
                            <a href={`tel:${s.telefon}`}>{s.telefon}</a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{s.hinweis || "-"}</td>
                        <td>{s.status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
