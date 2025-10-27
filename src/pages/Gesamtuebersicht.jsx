// src/pages/Gesamtuebersicht.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDays(iso, delta) {
  const d = new Date(iso);
  d.setDate(d.getDate() + delta);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Gesamtuebersicht({ fahrer }) {
  const [filters, setFilters] = useState({
    von: addDays(todayISO(), -7),
    bis: addDays(todayISO(), 14),
    fahrer_id: '',
    kunde: '',
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fahrerMap = useMemo(() => {
    const m = new Map();
    fahrer.forEach((f) => m.set(String(f.id), f.name));
    return m;
  }, [fahrer]);

  async function load() {
    try {
      setLoading(true);
      const data = await api.uebersicht({
        von: filters.von || undefined,
        bis: filters.bis || undefined,
        fahrer_id: filters.fahrer_id || undefined,
        kunde: filters.kunde || undefined,
      });
      setRows(data.items || data || []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 120px', gap: 8 }}>
          <div>
            <label>Von</label>
            <input
              type="date"
              value={filters.von}
              onChange={(e) => setFilters((p) => ({ ...p, von: e.target.value }))}
            />
          </div>
          <div>
            <label>Bis</label>
            <input
              type="date"
              value={filters.bis}
              onChange={(e) => setFilters((p) => ({ ...p, bis: e.target.value }))}
            />
          </div>
          <div className="select">
            <label>Fahrer</label>
            <select
              value={filters.fahrer_id}
              onChange={(e) => setFilters((p) => ({ ...p, fahrer_id: e.target.value }))}
            >
              <option value="">Alle</option>
              {fahrer.map((f) => (
                <option key={f.id} value={String(f.id)}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Kunde (Suche)</label>
            <input
              placeholder="z. B. Meyer"
              value={filters.kunde}
              onChange={(e) => setFilters((p) => ({ ...p, kunde: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <button className="btn" onClick={load} disabled={loading}>
              {loading ? '…' : 'Filtern'}
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Fahrer</th>
              <th>Tour-ID</th>
              <th># Stopps</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.datum}</td>
                <td>{r.fahrer_name || fahrerMap.get(String(r.fahrer_id)) || r.fahrer_id}</td>
                <td>{r.id}</td>
                <td>{r.stopp_count ?? r.stopps_count ?? '-'}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan="4">Keine Einträge gefunden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
