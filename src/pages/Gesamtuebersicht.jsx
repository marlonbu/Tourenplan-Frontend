import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Gesamtuebersicht({ fahrer }) {
  const [filter, setFilter] = useState({
    von: "",
    bis: "",
    fahrer_id: "",
    kunde: "",
  });
  const [touren, setTouren] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams(filter).toString();
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/touren-woche?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setTouren(data || []);
    } catch (e) {
      console.error(e);
      setTouren([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <h2 className="text-primary font-semibold text-lg">Filter</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-semibold block">Von</label>
            <input
              type="date"
              value={filter.von}
              onChange={(e) => setFilter({ ...filter, von: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold block">Bis</label>
            <input
              type="date"
              value={filter.bis}
              onChange={(e) => setFilter({ ...filter, bis: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold block">Fahrer</label>
            <select
              value={filter.fahrer_id}
              onChange={(e) => setFilter({ ...filter, fahrer_id: e.target.value })}
            >
              <option value="">Alle</option>
              {fahrer.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block">Kunde</label>
            <input
              type="text"
              placeholder="Kundenname"
              value={filter.kunde}
              onChange={(e) => setFilter({ ...filter, kunde: e.target.value })}
            />
          </div>
        </div>
        <button onClick={load} className="btn-primary mt-2">
          🔍 Anwenden
        </button>
      </div>

      {/* Tabelle */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Fahrer</th>
              <th>Kunde</th>
              <th>Adresse</th>
              <th>Kommission</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-3">
                  Lade Daten…
                </td>
              </tr>
            ) : touren.length ? (
              touren.map((t, i) => (
                <tr key={i}>
                  <td>{t.datum}</td>
                  <td>{t.fahrer_name}</td>
                  <td>{t.kunde}</td>
                  <td>{t.adresse}</td>
                  <td>{t.kommission}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 italic py-3">
                  Keine Touren gefunden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
