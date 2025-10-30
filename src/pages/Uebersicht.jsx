import React, { useEffect, useState } from "react";
import { api } from "../api";

// Kleines Utility für hübsches Datumsformat
function fmt(d) {
  try {
    return new Date(d).toLocaleDateString("de-DE");
  } catch {
    return d;
  }
}

export default function Uebersicht() {
  const [tab, setTab] = useState("gesamt"); // "gesamt" | "woche"

  // Filter
  const [fahrer, setFahrer] = useState([]);
  const [filterFahrer, setFilterFahrer] = useState(""); // "" = Alle Fahrer
  const [filterDatum, setFilterDatum] = useState("");   // YYYY-MM-DD
  const [filterKw, setFilterKw] = useState("");         // YYYY-Www (type="week")
  const [filterKunde, setFilterKunde] = useState("");

  // Daten
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    ladeFahrer();
    // Initial: gesamte Übersicht ohne Filter
    applyFilter();
  }, []);

  async function ladeFahrer() {
    try {
      const data = await api.listFahrer();
      setFahrer(data);
    } catch (err) {
      console.error("Fahrer laden fehlgeschlagen:", err);
    }
  }

  async function applyFilter() {
    try {
      setLoading(true);
      setMsg("");
      const payload =
        tab === "woche"
          ? {
              fahrer_id: filterFahrer || undefined,
              kw: filterKw || undefined,
              kunde: filterKunde || undefined,
            }
          : {
              fahrer_id: filterFahrer || undefined,
              datum: filterDatum || undefined,
              kw: filterKw || undefined, // darf auch im Gesamt-Tab genutzt werden
              kunde: filterKunde || undefined,
            };
      const data = await api.getUebersicht(payload);
      setRows(data);
      if (data.length === 0) setMsg("Keine Touren gefunden.");
    } catch (err) {
      console.error("Übersicht laden fehlgeschlagen:", err);
      setMsg("❌ Fehler beim Laden der Übersicht");
    } finally {
      setLoading(false);
    }
  }

  function resetFilter() {
    setFilterFahrer("");
    setFilterDatum("");
    setFilterKw("");
    setFilterKunde("");
    setRows([]);
    setMsg("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0058A3]">Gesamtübersicht</h1>

      {/* Unter-Tabs */}
      <div className="bg-white p-2 rounded-lg shadow flex gap-2">
        <button
          className={`px-4 py-2 rounded-md ${
            tab === "gesamt" ? "bg-[#0058A3] text-white" : "bg-gray-100"
          }`}
          onClick={() => setTab("gesamt")}
        >
          Gesamtübersicht
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            tab === "woche" ? "bg-[#0058A3] text-white" : "bg-gray-100"
          }`}
          onClick={() => setTab("woche")}
        >
          Wochenübersicht
        </button>
      </div>

      {/* Filter */}
      <section className="bg-white p-4 rounded-lg shadow space-y-3">
        <h2 className="text-lg font-medium text-[#0058A3]">Filter</h2>

        <div className="grid md:grid-cols-4 gap-3">
          {/* Fahrer */}
          <div>
            <label className="text-sm text-gray-600 block">Fahrer</label>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={filterFahrer}
              onChange={(e) => setFilterFahrer(e.target.value)}
            >
              <option value="">Alle Fahrer</option>
              {fahrer.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Datum (nur im Gesamt-Tab prominent) */}
          <div>
            <label className="text-sm text-gray-600 block">Datum</label>
            <input
              type="date"
              className="border rounded-md px-3 py-2 w-full"
              value={filterDatum}
              onChange={(e) => setFilterDatum(e.target.value)}
              disabled={tab === "woche"}
            />
          </div>

          {/* Kalenderwoche */}
          <div>
            <label className="text-sm text-gray-600 block">Kalenderwoche</label>
            <input
              type="week"
              className="border rounded-md px-3 py-2 w-full"
              value={filterKw}
              onChange={(e) => setFilterKw(e.target.value)}
            />
          </div>

          {/* Kunde (Textsuche) */}
          <div>
            <label className="text-sm text-gray-600 block">Kunde</label>
            <input
              type="text"
              className="border rounded-md px-3 py-2 w-full"
              placeholder="Kundenname suchen…"
              value={filterKunde}
              onChange={(e) => setFilterKunde(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={applyFilter}
            className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Filter anwenden
          </button>
          <button
            onClick={resetFilter}
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Zurücksetzen
          </button>
        </div>
      </section>

      {/* Tabelle */}
      <section className="bg-white p-4 rounded-lg shadow space-y-3">
        <h2 className="text-lg font-medium text-[#0058A3]">Touren</h2>

        {loading && <div className="text-gray-500">Laden…</div>}
        {!loading && msg && <div className="text-gray-600">{msg}</div>}

        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-[#0058A3] text-white">
                <tr>
                  <th className="border px-2 py-1">Datum</th>
                  <th className="border px-2 py-1">Fahrer</th>
                  <th className="border px-2 py-1">Kunden (Auszug)</th>
                  <th className="border px-2 py-1">Stopps</th>
                  <th className="border px-2 py-1">Bemerkung Tour</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{fmt(r.datum)}</td>
                    <td className="border px-2 py-1">{r.fahrer_name}</td>
                    <td className="border px-2 py-1">
                      {r.kunden_preview || <span className="text-gray-400">–</span>}
                    </td>
                    <td className="border px-2 py-1 text-center">{r.stopps_count}</td>
                    <td className="border px-2 py-1">
                      {r.bemerkung || <span className="text-gray-400">–</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
