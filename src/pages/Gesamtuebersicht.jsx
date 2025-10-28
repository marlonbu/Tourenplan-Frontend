import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const fmtDateISO = (d) => {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const fmtDE = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-DE");
  } catch {
    return iso;
  }
};

export default function Gesamtuebersicht() {
  const [fahrer, setFahrer] = useState([]);
  const [filterFahrer, setFilterFahrer] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kunde, setKunde] = useState("");
  const [items, setItems] = useState([]);
  const [details, setDetails] = useState({}); // tourId -> stopps[]
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Fahrer laden
  useEffect(() => {
    api.listFahrer().then(setFahrer).catch(() => setMsg("❌ Fehler beim Laden der Fahrer"));
  }, []);

  const query = useMemo(
    () => ({
      fahrerId: filterFahrer || undefined,
      from: from || undefined,
      to: to || undefined,
      kunde: kunde || undefined,
    }),
    [filterFahrer, from, to, kunde]
  );

  const loadTours = async () => {
    setLoading(true);
    setMsg("");
    try {
      const data = await api.getGesamtTours(query);
      setItems(data);
    } catch {
      setMsg("❌ Fehler beim Laden der Gesamtübersicht");
    } finally {
      setLoading(false);
    }
  };

  // Initial laden (optional ohne Filter)
  useEffect(() => { loadTours(); /* eslint-disable-next-line */ }, []);

  const toggleDetails = async (tourId) => {
    if (details[tourId]) {
      // einklappen
      setDetails(prev => {
        const copy = { ...prev };
        delete copy[tourId];
        return copy;
      });
      return;
    }
    try {
      const stopps = await api.listStoppsByTour(tourId);
      setDetails(prev => ({ ...prev, [tourId]: stopps }));
    } catch {
      setMsg("❌ Fehler beim Laden der Tourdetails");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0058A3]">Gesamtübersicht</h1>

      {/* Filter */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-sm text-gray-600">Fahrer</label>
            <select
              value={filterFahrer}
              onChange={(e) => setFilterFahrer(e.target.value)}
              className="mt-1 border rounded-md px-3 py-2 w-full"
            >
              <option value="">Alle Fahrer</option>
              {fahrer.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Von</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 border rounded-md px-3 py-2 w-full"
              placeholder={fmtDateISO(new Date())}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Bis</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 border rounded-md px-3 py-2 w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Kunde (Suche)</label>
            <input
              type="text"
              value={kunde}
              onChange={(e) => setKunde(e.target.value)}
              className="mt-1 border rounded-md px-3 py-2 w-full"
              placeholder="z. B. Meyer"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadTours}
              className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition w-full"
            >
              Filtern
            </button>
          </div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#0058A3]">Touren</h2>
          {loading && <span className="text-sm text-gray-500">Laden…</span>}
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">Keine Touren gefunden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#0058A3] text-white">
                  <th className="px-3 py-2 text-left">Datum</th>
                  <th className="px-3 py-2 text-left">Fahrer</th>
                  <th className="px-3 py-2 text-left">Stopps</th>
                  <th className="px-3 py-2 text-left">Kunden (bis 10)</th>
                  <th className="px-3 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <React.Fragment key={t.id}>
                    <tr className="odd:bg-gray-50">
                      <td className="px-3 py-2">{fmtDE(t.datum)}</td>
                      <td className="px-3 py-2">{t.fahrer?.name || "—"}</td>
                      <td className="px-3 py-2">{t.stopp_count}</td>
                      <td className="px-3 py-2">
                        {t.kunden?.length ? t.kunden.join(", ") : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => toggleDetails(t.id)}
                          className="bg-[#0058A3] text-white px-3 py-1 rounded hover:bg-blue-800 transition"
                        >
                          {details[t.id] ? "Schließen" : "Details"}
                        </button>
                      </td>
                    </tr>

                    {details[t.id] && (
                      <tr className="bg-blue-50">
                        <td className="px-3 py-3" colSpan={5}>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="text-[#0058A3]">
                                  <th className="px-2 py-1 text-left">Pos</th>
                                  <th className="px-2 py-1 text-left">Kunde</th>
                                  <th className="px-2 py-1 text-left">Adresse</th>
                                  <th className="px-2 py-1 text-left">Kommission</th>
                                  <th className="px-2 py-1 text-left">Telefon</th>
                                  <th className="px-2 py-1 text-left">Ankunft</th>
                                  <th className="px-2 py-1 text-left">Hinweis</th>
                                </tr>
                              </thead>
                              <tbody>
                                {details[t.id].map((s) => (
                                  <tr key={s.id} className="odd:bg-white">
                                    <td className="px-2 py-1">{s.position ?? 0}</td>
                                    <td className="px-2 py-1">{s.kunde || "—"}</td>
                                    <td className="px-2 py-1">{s.adresse || "—"}</td>
                                    <td className="px-2 py-1">{s.kommission || "—"}</td>
                                    <td className="px-2 py-1">
                                      {s.telefon ? <a className="text-[#0058A3] underline" href={`tel:${s.telefon}`}>{s.telefon}</a> : "—"}
                                    </td>
                                    <td className="px-2 py-1">{s.ankunft || "—"}</td>
                                    <td className="px-2 py-1">{s.hinweis || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-md text-sm ${
          msg.startsWith("❌") ? "bg-red-50 border border-red-300 text-red-700"
                               : "bg-green-50 border border-green-300 text-green-700"
        }`}>
          {msg}
        </div>
      )}
    </div>
  );
}
