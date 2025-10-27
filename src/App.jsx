import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import MapView from "./components/MapView";
import Planung from "./pages/Planung";
import Gesamtuebersicht from "./pages/Gesamtuebersicht";

// Helper
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

// ---------------------------------------------
// 🔹 Tagestour mit Karte + Foto-Upload
// ---------------------------------------------
function Tagestour({ fahrer, selectedFahrerId }) {
  const [datum, setDatum] = useState(todayISO());
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [loading, setLoading] = useState(false);

  // Daten laden
  useEffect(() => {
    if (!selectedFahrerId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getTourForDay(selectedFahrerId, datum);
        setTour(data.tour);
        const enriched = await Promise.all(
          (data.stopps || []).map(async (s) => {
            const coords = await geocode(s.adresse);
            return { ...s, coords };
          })
        );
        setStopps(enriched);
      } catch (e) {
        console.error(e);
        setStopps([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedFahrerId, datum]);

  // Upload
  async function handleUpload(e, stoppId) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("foto", file);
    formData.append("stopp_id", stoppId);

    await fetch(`${import.meta.env.VITE_API_BASE}/upload-foto`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });

    // Reload stopps
    const refreshed = await api.getTourForDay(selectedFahrerId, datum);
    setStopps(refreshed.stopps);
  }

  return (
    <div>
      <div className="flex gap-2 items-end mb-3">
        <input
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Lade Tour…</div>
      ) : !tour ? (
        <div>Keine Tour gefunden.</div>
      ) : (
        <>
          <MapView stopps={stopps} />
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kunde</th>
                  <th>Adresse</th>
                  <th>Foto</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s, i) => (
                  <tr key={s.id}>
                    <td>{s.position ?? i + 1}</td>
                    <td>{s.kunde}</td>
                    <td>{s.adresse}</td>
                    <td>
                      {s.foto_url ? (
                        <a
                          href={s.foto_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Foto ansehen"
                        >
                          📷
                        </a>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleUpload(e, s.id)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
                {!stopps.length && (
                  <tr>
                    <td colSpan="4">Keine Stopps vorhanden.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// Geocoding-Helfer (OpenStreetMap)
async function geocode(address) {
  try {
    const q = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}`
    );
    const data = await res.json();
    if (data[0])
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {
    /* ignore */
  }
  return null;
}

// ---------------------------------------------
// 🔸 Haupt-App
// ---------------------------------------------
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loginForm, setLoginForm] = useState({
    username: "Gehlenborg",
    password: "Orga1023/",
  });
  const [tab, setTab] = useState("tagestour");
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrerId, setSelectedFahrerId] = useState("");

  async function doLogin(e) {
    e.preventDefault();
    try {
      const res = await api.login(loginForm.username, loginForm.password);
      setToken(res.token);
    } catch (e) {
      alert("Login fehlgeschlagen");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
  }

  // Fahrer laden
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const list = await api.listFahrer();
        setFahrer(list);
        if (list.length && !selectedFahrerId)
          setSelectedFahrerId(String(list[0].id));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [token]);

  const fahrerMap = useMemo(() => {
    const m = new Map();
    fahrer.forEach((f) => m.set(String(f.id), f.name));
    return m;
  }, [fahrer]);

  // Login-Ansicht
  if (!token) {
    return (
      <div className="container">
        <h1>Tourenplan – Login</h1>
        <form
          onSubmit={doLogin}
          className="card"
          style={{ maxWidth: 420 }}
        >
          <div className="field">
            <label>Benutzername</label>
            <input
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((p) => ({
                  ...p,
                  username: e.target.value,
                }))
              }
            />
          </div>
          <div className="field">
            <label>Passwort</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((p) => ({
                  ...p,
                  password: e.target.value,
                }))
              }
            />
          </div>
          <button type="submit" className="btn-primary">
            Anmelden
          </button>
        </form>
      </div>
    );
  }

  // App-Ansicht
  return (
    <div className="container">
      <header className="app-header">
        <h1>Tourenplan</h1>
        <div className="header-actions">
          <div className="select">
            <label>Fahrer</label>
            <select
              value={selectedFahrerId}
              onChange={(e) => setSelectedFahrerId(e.target.value)}
              style={{ minWidth: 160 }}
            >
              {fahrer.map((f) => (
                <option key={f.id} value={String(f.id)}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={classNames("tab", tab === "tagestour" && "active")}
          onClick={() => setTab("tagestour")}
        >
          Tagestour
        </button>
        <button
          className={classNames("tab", tab === "planung" && "active")}
          onClick={() => setTab("planung")}
        >
          Planung
        </button>
        <button
          className={classNames("tab", tab === "uebersicht" && "active")}
          onClick={() => setTab("uebersicht")}
        >
          Gesamtübersicht
        </button>
      </nav>

      <main>
        {tab === "tagestour" && (
          <Tagestour
            fahrer={fahrer}
            selectedFahrerId={selectedFahrerId}
          />
        )}
        {tab === "planung" && (
          <Planung
            fahrer={fahrer}
            selectedFahrerId={selectedFahrerId}
            setSelectedFahrerId={setSelectedFahrerId}
          />
        )}
        {tab === "uebersicht" && <Gesamtuebersicht fahrer={fahrer} />}
      </main>
    </div>
  );
}
