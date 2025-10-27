// src/pages/Planung.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Planung({ fahrer, selectedFahrerId, setSelectedFahrerId }) {
  const [datum, setDatum] = useState(todayISO());
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stoppForm, setStoppForm] = useState({
    kunde: '',
    adresse: '',
    kommission: '',
    hinweis: '',
    telefon: '',
    position: '',
  });

  const fahrerMap = useMemo(() => {
    const m = new Map();
    fahrer.forEach((f) => m.set(String(f.id), f.name));
    return m;
  }, [fahrer]);

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

  async function createTour() {
    try {
      const t = await api.createTour({ fahrer_id: Number(selectedFahrerId), datum });
      setTour(t);
    } catch (e) {
      alert('Tour konnte nicht erstellt werden (existiert evtl. bereits).');
      console.error(e);
    }
  }

  async function saveStopp() {
    if (!tour?.id) {
      alert('Bitte zuerst eine Tour anlegen.');
      return;
    }
    const payload = {
      tour_id: tour.id,
      kunde: stoppForm.kunde.trim(),
      adresse: stoppForm.adresse.trim(),
      kommission: stoppForm.kommission || null,
      hinweis: stoppForm.hinweis || null,
      telefon: stoppForm.telefon || null,
      position: stoppForm.position ? Number(stoppForm.position) : null,
    };
    if (!payload.kunde || !payload.adresse) {
      alert('Kunde und Adresse sind Pflichtfelder.');
      return;
    }
    try {
      const created = await api.createStopp(payload);
      setStopps((prev) => [...prev, created].sort(sortStopps));
      setStoppForm({ kunde: '', adresse: '', kommission: '', hinweis: '', telefon: '', position: '' });
    } catch (e) {
      alert('Stopp konnte nicht angelegt werden.');
      console.error(e);
    }
  }

  async function updateStopp(stoppId, patch) {
    try {
      const updated = await api.updateStopp(stoppId, patch);
      setStopps((prev) => prev.map((s) => (s.id === stoppId ? updated : s)).sort(sortStopps));
    } catch (e) {
      alert('Stopp konnte nicht aktualisiert werden.');
      console.error(e);
    }
  }

  async function deleteStopp(stoppId) {
    if (!confirm('Stopp wirklich löschen?')) return;
    try {
      await api.deleteStopp(stoppId);
      setStopps((prev) => prev.filter((s) => s.id !== stoppId));
    } catch (e) {
      alert('Stopp konnte nicht gelöscht werden.');
      console.error(e);
    }
  }

  function sortStopps(a, b) {
    const pa = a.position ?? 999999;
    const pb = b.position ?? 999999;
    if (pa !== pb) return pa - pb;
    return a.id - b.id;
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="flex gap-12 flex-wrap">
          <div className="select">
            <label>Fahrer</label>
            <select
              value={selectedFahrerId}
              onChange={(e) => setSelectedFahrerId(e.target.value)}
            >
              {fahrer.map((f) => (
                <option key={f.id} value={String(f.id)}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Datum</label>
            <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
          </div>

          <div className="flex items-end gap-8">
            <div>
              <label>Tour</label>
              <div>
                {tour ? (
                  <b>#{tour.id} • {fahrerMap.get(String(tour.fahrer_id))} • {tour.datum}</b>
                ) : (
                  <span>Keine Tour vorhanden</span>
                )}
              </div>
            </div>

            {!tour && (
              <button className="btn-primary" onClick={createTour}>Tour anlegen</button>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h3>Stopp hinzufügen</h3>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 120px', gap: 8 }}>
          <div>
            <label>Kunde *</label>
            <input value={stoppForm.kunde} onChange={(e) => setStoppForm((p) => ({ ...p, kunde: e.target.value }))} />
          </div>
          <div>
            <label>Adresse *</label>
            <input value={stoppForm.adresse} onChange={(e) => setStoppForm((p) => ({ ...p, adresse: e.target.value }))} />
          </div>
          <div>
            <label>Kommission</label>
            <input value={stoppForm.kommission} onChange={(e) => setStoppForm((p) => ({ ...p, kommission: e.target.value }))} />
          </div>
          <div>
            <label>Hinweis</label>
            <input value={stoppForm.hinweis} onChange={(e) => setStoppForm((p) => ({ ...p, hinweis: e.target.value }))} />
          </div>
          <div>
            <label>Telefon</label>
            <input value={stoppForm.telefon} onChange={(e) => setStoppForm((p) => ({ ...p, telefon: e.target.value }))} />
          </div>
          <div>
            <label>Position</label>
            <input type="number" value={stoppForm.position} onChange={(e) => setStoppForm((p) => ({ ...p, position: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={saveStopp} disabled={!tour}>Stopp speichern</button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Kunde</th>
              <th>Adresse</th>
              <th>Kommission</th>
              <th>Telefon</th>
              <th>Status</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {stopps.map((s) => (
              <tr key={s.id}>
                <td>
                  <input
                    type="number"
                    value={s.position ?? ''}
                    onChange={(e) => updateStopp(s.id, { position: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: 70 }}
                  />
                </td>
                <td>
                  <input
                    value={s.kunde}
                    onChange={(e) => updateStopp(s.id, { kunde: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={s.adresse}
                    onChange={(e) => updateStopp(s.id, { adresse: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={s.kommission || ''}
                    onChange={(e) => updateStopp(s.id, { kommission: e.target.value || null })}
                  />
                </td>
                <td>
                  <input
                    value={s.telefon || ''}
                    onChange={(e) => updateStopp(s.id, { telefon: e.target.value || null })}
                  />
                </td>
                <td>
                  <select
                    value={s.status || 'offen'}
                    onChange={(e) => updateStopp(s.id, { status: e.target.value })}
                  >
                    <option value="offen">offen</option>
                    <option value="in_bearbeitung">in_bearbeitung</option>
                    <option value="erledigt">erledigt</option>
                  </select>
                </td>
                <td>
                  <button className="btn-danger" onClick={() => deleteStopp(s.id)}>Löschen</button>
                </td>
              </tr>
            ))}
            {!stopps.length && (
              <tr><td colSpan="7">Keine Stopps vorhanden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
