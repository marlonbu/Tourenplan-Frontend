// src/App.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import Planung from './pages/Planung';
import Gesamtuebersicht from './pages/Gesamtuebersicht';

// Hilfsfunktionen
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function classNames(...arr) {
  return arr.filter(Boolean).join(' ');
}

// Einfache Tagestour-Ansicht (kompakt, nutzt /touren/:fahrerId/:datum)
function Tagestour({ fahrer, selectedFahrerId }) {
  const [datum, setDatum] = useState(todayISO());
  const [loading, setLoading] = useState(false);
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);

  useEffect(() => {
    if (!selectedFahrerId || !datum) return;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getTourForDay(selectedFahrerId, datum);
        setTour(data.tour);
        setStopps(data.stopps || []);
      } catch (e) {
        console.error(e);
        setTour(null);
        setStopps([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedFahrerId, datum]);

  return (
    <div>
      <div className="flex gap-2 items-end mb-3">
        <div>
          <label>Datum</label>
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div>lädt…</div>
      ) : !tour ? (
        <div>Keine Tour gefunden.</div>
      ) : (
        <>
          <div className="mb-2"><b>Tour #{tour.id}</b> • Fahrer #{tour.fahrer_id} • {tour.datum}</div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kunde</th>
                  <th>Adresse</th>
                  <th>Kommission</th>
                  <th>Telefon</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s, i) => (
                  <tr key={s.id}>
                    <td>{s.position ?? i + 1}</td>
                    <td>{s.kunde}</td>
                    <td>{s.adresse}</td>
                    <td>{s.kommission || '-'}</td>
                    <td>{s.telefon || '-'}</td>
                    <td>{s.status || '-'}</td>
                  </tr>
                ))}
                {!stopps.length && (
                  <tr>
                    <td colSpan="6">Keine Stopps vorhanden.</td>
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

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loginForm, setLoginForm] = useState({ username: 'Gehlenborg', password: 'Orga1023/' });
  const [tab, setTab] = useState('tagestour'); // tagestour | planung | uebersicht
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrerId, setSelectedFahrerId] = useState('');

  // Login
  async function doLogin(e) {
    e.preventDefault();
    try {
      const res = await api.login(loginForm.username, loginForm.password);
      setToken(res.token);
    } catch (e) {
      alert('Login fehlgeschlagen');
      console.error(e);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken('');
  }

  // Fahrerliste laden
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const list = await api.listFahrer();
        setFahrer(list);
        if (list.length && !selectedFahrerId) {
          setSelectedFahrerId(String(list[0].id));
        }
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

  if (!token) {
    return (
      <div className="container">
        <h1>Tourenplan – Login</h1>
        <form onSubmit={doLogin} className="card" style={{ maxWidth: 420 }}>
          <div className="field">
            <label>Benutzername</label>
            <input
              value={loginForm.username}
              onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="Gehlenborg"
            />
          </div>
          <div className="field">
            <label>Passwort</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Orga1023/"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
            Anmelden
          </button>
        </form>
      </div>
    );
  }

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
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={classNames('tab', tab === 'tagestour' && 'active')}
          onClick={() => setTab('tagestour')}
        >
          Tagestour
        </button>
        <button
          className={classNames('tab', tab === 'planung' && 'active')}
          onClick={() => setTab('planung')}
        >
          Planung
        </button>
        <button
          className={classNames('tab', tab === 'uebersicht' && 'active')}
          onClick={() => setTab('uebersicht')}
        >
          Gesamtübersicht
        </button>
      </nav>

      <main>
        {tab === 'tagestour' && (
          <Tagestour fahrer={fahrer} selectedFahrerId={selectedFahrerId} />
        )}

        {tab === 'planung' && (
          <Planung
            fahrer={fahrer}
            selectedFahrerId={selectedFahrerId}
            setSelectedFahrerId={setSelectedFahrerId}
          />
        )}

        {tab === 'uebersicht' && (
          <Gesamtuebersicht fahrer={fahrer} />
        )}
      </main>
    </div>
  );
}
