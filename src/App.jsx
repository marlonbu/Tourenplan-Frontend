import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import MapView from "./components/MapView";
import Planung from "./pages/Planung";
import Gesamtuebersicht from "./pages/Gesamtuebersicht";

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ------------------------------------------------------------
// Tagestour mit Karte + Foto-Upload
// ------------------------------------------------------------
function Tagestour({ fahrer, selectedFahrerId }) {
  const [datum, setDatum] = useState(todayISO());
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFahrerId) return;
    (async () => {
      setLoading(true);
      try {
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
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedFahrerId, datum]);

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
    const refreshed = await api.getTourForDay(selectedFahrerId, datum);
    setStopps(refreshed.stopps);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Datum</label>
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Lade Tour…</div>
      ) : !tour ? (
        <div className="text-gray-500">Keine Tour gefunden.</div>
      ) : (
        <>
          <MapView stopps={stopps} />
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full border-collapse bg-white">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">Kunde</th>
                  <th className="py-2 px-3 text-left">Adresse</th>
                  <th className="py-2 px-3 text-left">Foto</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s, i) => (
                  <tr
                    key={s.id}
                    className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="py-2 px-3">{s.position ?? i + 1}</td>
                    <td className="py-2 px-3">{s.kunde}</td>
                    <td className="py-2 px-3">{s.adresse}</td>
                    <td className="py-2 px-3">
                      {s.foto_url ? (
                        <a
                          href={s.foto_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          📷
                        </a>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleUpload(e, s.id)}
                          className="text-sm"
                        />
                      )}
                    </td>
                  </tr>
                ))}
                {!stopps.length && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-3 text-center text-gray-400 italic"
                    >
                      Keine Stopps vorhanden
                    </td>
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

async function geocode(address) {
  try {
    const q = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}`
    );
    const data = await res.json();
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {
    return null;
  }
  return null;
}

// ------------------------------------------------------------
// Haupt-App
// ------------------------------------------------------------
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
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
    } catch {
      alert("Login fehlgeschlagen");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
  }

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

  // ---- Login-View ----
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={doLogin}
          className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4"
        >
          <h1 className="text-2xl font-bold text-primary text-center">
            Tourenplan Login
          </h1>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Benutzername
            </label>
            <input
              className="border w-full px-3 py-2 rounded-md"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, username: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Passwort
            </label>
            <input
              type="password"
              className="border w-full px-3 py-2 rounded-md"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, password: e.target.value }))
              }
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white w-full py-2 rounded-md hover:bg-blue-700 transition"
          >
            Anmelden
          </button>
        </form>
      </div>
    );
  }

  // ---- Haupt-App ----
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Tourenplan</h1>
          <div className="flex gap-4 items-center">
            <select
              value={selectedFahrerId}
              onChange={(e) => setSelectedFahrerId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {fahrer.map((f) => (
                <option key={f.id} value={String(f.id)}>
                  {f.name}
                </option>
              ))}
            </select>
            <button
              onClick={logout}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="max-w-6xl mx-auto flex gap-2 mb-6">
        {[
          ["tagestour", "Tagestour"],
          ["planung", "Planung"],
          ["uebersicht", "Gesamtübersicht"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              tab === key
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-10">
        {tab === "tagestour" && (
          <Tagestour fahrer={fahrer} selectedFahrerId={selectedFahrerId} />
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
