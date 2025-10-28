import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export default function Gesamtuebersicht() {
  const [fahrer, setFahrer] = useState([]);
  const [filters, setFilters] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const lastWeek = d.toISOString().split("T")[0];
    return { von: lastWeek, bis: today, fahrer_id: "", kunde: "" };
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 25;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rows.length / pageSize)),
    [rows.length]
  );
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  useEffect(() => {
    api
      .listFahrer()
      .then(setFahrer)
      .catch(() => setErr("Fehler beim Laden der Fahrer"));
  }, []);

  async function loadData() {
    setLoading(true);
    setErr("");
    setPage(1);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(
          ([, v]) => v !== undefined && v !== null && String(v) !== ""
        )
      );
      const data = await api.getTourenWoche(params);
      setRows(
        data.map((r, idx) => ({
          nr: idx + 1,
          datum: r.datum,
          fahrer: r.fahrer_name,
          kunde: r.kunde,
          adresse: r.adresse,
          kommission: r.kommission,
        }))
      );
    } catch {
      setErr("Daten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Filterbereich */}
      <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Datum von</label>
          <input
            type="date"
            value={filters.von || ""}
            onChange={(e) => setFilters({ ...filters, von: e.target.value })}
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Datum bis</label>
          <input
            type="date"
            value={filters.bis || ""}
            onChange={(e) => setFilters({ ...filters, bis: e.target.value })}
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Fahrer</label>
          <select
            value={filters.fahrer_id}
            onChange={(e) =>
              setFilters({ ...filters, fahrer_id: e.target.value })
            }
            className="border rounded-md px-3 py-2 w-full"
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
          <label className="block text-sm font-semibold mb-1">Kunde</label>
          <input
            type="text"
            value={filters.kunde}
            onChange={(e) => setFilters({ ...filters, kunde: e.target.value })}
            placeholder="optional"
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={loadData}
            className="bg-[#0058A3] text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition w-full"
          >
            Laden
          </button>
        </div>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {err}
        </div>
      )}

      {/* Tabelle */}
      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#0058A3] text-white">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Datum</th>
              <th className="px-3 py-2 text-left">Fahrer</th>
              <th className="px-3 py-2 text-left">Kunde</th>
              <th className="px-3 py-2 text-left">Adresse</th>
              <th className="px-3 py-2 text-left">Kommission</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  Lädt …
                </td>
              </tr>
            )}
            {!loading &&
              pagedRows.map((r) => (
                <tr
                  key={`${r.nr}-${r.datum}-${r.kunde}`}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-3 py-2">{r.nr}</td>
                  <td className="px-3 py-2">{r.datum}</td>
                  <td className="px-3 py-2">{r.fahrer}</td>
                  <td className="px-3 py-2">{r.kunde}</td>
                  <td className="px-3 py-2">{r.adresse}</td>
                  <td className="px-3 py-2">{r.kommission}</td>
                </tr>
              ))}
            {!loading && !rows.length && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-gray-400 italic py-4"
                >
                  Keine Daten für den angegebenen Zeitraum gefunden
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {rows.length > pageSize && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              Seite {page} / {totalPages} — {rows.length} Einträge
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-40"
              >
                ←
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
