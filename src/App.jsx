import React, { useState, useEffect, useMemo } from "react";
import "./App.css";

/**
 * Frontend für Tourenplan
 * - Login (JWT) mit Persistenz im localStorage
 * - Fahrer + Datum Auswahl
 * - Tabelle: Reihenfolge, Kunde, Kommission, Adresse, Telefon (klickbar), Hinweis, Status (editierbar)
 * - Buttons: "Demo neu laden" (Reset + Seed), "Route in Google Maps öffnen"
 * - Map-Container bleibt vorhanden (falls später wieder OSM-Routing eingeblendet wird)
 *
 * Erwartete Backend-Endpoints:
 *  POST   /login  -> { token }
 *  GET    /fahrer
 *  GET    /touren/:fahrerId/:datum -> { tour, stopps[] } mit Feldern telefon, hinweis, status
 *  PATCH  /stopps/:stoppId         -> { ...updated stopp }
 *  POST   /reset
 *  POST   /seed-demo
 */

const API_URL = "https://tourenplan.onrender.com";

function App() {
  // Auth
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const isLoggedIn = !!token;

  // Stammdaten + Auswahl
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));

  // Tourdaten
  const [tourMeta, setTourMeta] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Token aus localStorage laden
  useEffect(() => {
    const t = localStorage.getItem("tourenplan_token");
    if (t) setToken(t);
  }, []);

  // --- Nach Login: Fahrer laden
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/fahrer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Fehler beim Laden der Fahrer");
        const data = await res.json();
        setFahrer(data);
        if (data?.length && !selectedFahrer) {
          setSelectedFahrer(String(data[0].id));
        }
      } catch (e) {
        console.error(e);
        alert("Fahrer konnten nicht geladen werden.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // --- Tour laden, wenn Fahrer/Datum gesetzt
  const canLoadTour = useMemo(() => isLoggedIn && selectedFahrer && datum, [isLoggedIn, selectedFahrer, datum]);

  const loadTour = async () => {
    if (!canLoadTour) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/touren/${selectedFahrer}/${datum}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Fehler beim Laden der Tour");
      const data = await res.json();
      setTourMeta(data.tour);
      setStopps(data.stopps || []);
    } catch (e) {
      console.error(e);
      alert("Tourdaten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canLoadTour) loadTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFahrer, datum, token]);

  // --- Login
  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        alert("Login fehlgeschlagen");
        return;
      }
      const data = await res.json();
      localStorage.setItem("tourenplan_token", data.token);
      setToken(data.token);
      setUsername("");
      setPassword("");
    } catch (e) {
      console.error(e);
      alert("Login derzeit nicht möglich.");
    }
  };

  const onLogout = () => {
    localStorage.removeItem("tourenplan_token");
    setToken("");
    setFahrer([]);
    setTourMeta(null);
    setStopps([]);
  };

  // --- Helpers
  const telHref = (t) => {
    if (!t) return null;
    // Entfernt Leerzeichen/Bindestriche für den tel:-Link
    const digits = String(t).replace(/[^\d+]/g, "");
    return `tel:${digits}`;
  };

  const googleMapsRouteUrl = () => {
    if (!stopps?.length) return null;
    const q = stopps.map((s) => encodeURIComponent(s.adresse)).join("/");
    // Verwende "dir" Modus → Wegpunkte in Reihenfolge
    return `https://www.google.com/maps/dir/${q}`;
  };

  // --- Status/Telefon/Hinweis speichern (PATCH /stopps/:id)
  const updateStoppField = async (stoppId, patch) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/stopps/${stoppId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      const updated = await res.json();
      setStopps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (e) {
      console.error(e);
      alert("Änderung konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  // --- Demo neu laden
  const reloadDemo = async () => {
    if (!isLoggedIn) return;
    const ok = confirm("Demo-Daten wirklich neu laden? (Reset + Seed)");
    if (!ok) return;
    try {
      const reset = await fetch(`${API_URL}/reset`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!reset.ok) throw new Error("Reset fehlgeschlagen");
      const seed = await fetch(`${API_URL}/seed-demo`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!seed.ok) throw new Error("Seed fehlgeschlagen");
      await loadTour();
    } catch (e) {
      console.error(e);
      alert("Demo konnte nicht neu geladen werden.");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Tourenplan</h1>
        {isLoggedIn ? (
          <div className="user">
            <span className="badge">Eingeloggt</span>
            <button className="btn secondary" onClick={onLogout}>Logout</button>
          </div>
        ) : null}
      </header>

      {!isLoggedIn ? (
        <form className="card login" onSubmit={onLogin}>
          <h2>Login</h2>
          <div className="row">
            <label>Benutzername</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Gehlenborg" />
          </div>
          <div className="row">
            <label>Passwort</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Orga1023/" />
          </div>
          <button className="btn primary" type="submit">Einloggen</button>
        </form>
      ) : (
        <>
          <div className="card controls">
            <div className="row">
              <label>Fahrer</label>
              <select value={selectedFahrer} onChange={(e) => setSelectedFahrer(e.target.value)}>
                {fahrer.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="row">
              <label>Datum</label>
              <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
            </div>
            <div className="row buttons">
              <button className="btn" onClick={loadTour} disabled={!canLoadTour || loading}>
                {loading ? "Laden…" : "Aktualisieren"}
              </button>
              <button className="btn" onClick={reloadDemo}>🔄 Demo neu laden</button>
              {googleMapsRouteUrl() ? (
                <a className="btn link" href={googleMapsRouteUrl()} target="_blank" rel="noreferrer">
                  📍 Route in Google Maps öffnen
                </a>
              ) : null}
            </div>
          </div>

          {/* Info-Bar */}
          <div className="bar">
            <div>Fahrer: <strong>{tourMeta?.fahrer_name || "-"}</strong></div>
            <div>Fahrzeug: <strong>{tourMeta?.kennzeichen || "-"}</strong></div>
            <div>Datum: <strong>{tourMeta?.datum || datum}</strong></div>
            {saving ? <div className="saving">Speichern…</div> : null}
          </div>

          {/* Tabelle */}
          <div className="card table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ankunftszeit</th>
                  <th>Kunde</th>
                  <th>Kommission</th>
                  <th>Adresse</th>
                  <th>Telefon</th>
                  <th>Hinweis</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s) => (
                  <tr key={s.id}>
                    <td className="mono">{s.reihenfolge}</td>
                    {/* Ankunftszeit: evtl. später befüllt – aktuell Placeholder */}
                    <td className="muted">-</td>
                    <td>{s.kunde || "-"}</td>
                    <td className="mono">{s.kommission || "-"}</td>
                    <td>{s.adresse}</td>

                    {/* Telefon klickbar */}
                    <td>
                      {s.telefon ? (
                        <a className="tel" href={telHref(s.telefon)}>{s.telefon}</a>
                      ) : (
                        <span className="muted">-</span>
                      )}
                    </td>

                    {/* Hinweis (ersetzt frühere "Anmerkung") – inline editierbar */}
                    <td className="cell-input">
                      <input
                        type="text"
                        defaultValue={s.hinweis || ""}
                        placeholder="Hinweis eingeben…"
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val !== (s.hinweis || "")) {
                            updateStoppField(s.id, { hinweis: val });
                          }
                        }}
                      />
                    </td>

                    {/* Status (beschreibbar) */}
                    <td className="cell-input">
                      <input
                        type="text"
                        defaultValue={s.status || ""}
                        placeholder="z. B. abgeladen, unterwegs…"
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val !== (s.status || "")) {
                            updateStoppField(s.id, { status: val });
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
                {(!stopps || stopps.length === 0) && (
                  <tr>
                    <td colSpan={8} className="muted center">Keine Stopps gefunden.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Karte / Map-Container (Turn-by-Turn rechts deaktiviert laut Anforderung) */}
          <div className="card map">
            <div className="map-placeholder">
              <div>🗺️ Kartenansicht</div>
              <div className="muted small">OSM-Routing bleibt aktiv, Konfiguration unverändert (UI-Platzhalter).</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
