import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState("");
  const [tour, setTour] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = "https://tourenplan.onrender.com";

  // Login
  const handleLogin = async () => {
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error("Login fehlgeschlagen");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
    } catch (err) {
      alert("❌ Ungültiger Benutzername oder Passwort");
    }
  };

  // Fahrer laden
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      fetch(`${apiUrl}/fahrer`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then(setFahrer)
        .catch((err) => console.error(err));
    }
  }, [isLoggedIn]);

  // Tour laden
  const ladeTour = () => {
    if (!selectedFahrer || !datum) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${apiUrl}/touren/${selectedFahrer}/${datum}`, {
      headers: { Authorization: `Bearer ${token}` }
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

          {tour.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Ankunftszeit</th>
                  <th>Kunde</th>
                  <th>Kommission</th>
                  <th>Adresse</th>
                  <th>Telefon</th>
                  <th>Hinweis</th>
                </tr>
              </thead>
              <tbody>
                {tour.map((stopp, i) => (
                  <tr key={i}>
                    <td>{stopp.ankunftszeit || "08:00"}</td>
                    <td>{stopp.kunde || `Kunde ${i + 1}`}</td>
                    <td>{stopp.kommission || `KOM-${1000 + i}`}</td>
                    <td>{stopp.adresse}</td>
                    <td>
                      {stopp.telefon ? (
                        <a href={`tel:${stopp.telefon}`}>{stopp.telefon}</a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{stopp.anmerkung || "-"}</td>
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
