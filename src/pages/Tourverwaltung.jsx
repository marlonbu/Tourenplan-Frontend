import React, { useEffect, useState } from "react";
import { api } from "../api";

// Datum hübsch
function fmt(d) {
  try {
    return new Date(d).toLocaleDateString("de-DE");
  } catch {
    return d;
  }
}

export default function Tourverwaltung() {
  // Filter
  const [fahrer, setFahrer] = useState([]);
  const [filterFahrer, setFilterFahrer] = useState(""); // "" = Alle
  const [filterVon, setFilterVon] = useState("");
  const [filterBis, setFilterBis] = useState("");
  const [filterKw, setFilterKw] = useState("");
  const [filterKunde, setFilterKunde] = useState("");

  // Daten
  const [touren, setTouren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Expanded: tour_id -> Stopps[]
  const [stoppsMap, setStoppsMap] = useState({}); // { [tourId]: array }
  // Edit-States
  const [editTour, setEditTour] = useState({}); // { [tourId]: { fahrer_id, datum, bemerkung } }
  const [editStopp, setEditStopp] = useState({}); // { [stoppId]: { ...fields } }

  useEffect(() => {
    ladeFahrer();
    ladeTouren(); // initial
  }, []);

  async function ladeFahrer() {
    try {
      const data = await api.listFahrer();
      setFahrer(data);
    } catch {}
  }

  async function ladeTouren() {
    try {
      setLoading(true);
      setMsg("");
      const payload = {
        fahrer_id: filterFahrer || undefined,
        date_from: filterVon || undefined,
        date_to: filterBis || undefined,
        kw: filterKw || undefined,
        kunde: filterKunde || undefined,
      };
      const data = await api.getTourenAdmin(payload);
      setTouren(data);
      if (data.length === 0) setMsg("Keine Touren gefunden.");
    } catch (err) {
      setMsg("❌ Fehler beim Laden der Touren");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetFilter() {
    setFilterFahrer("");
    setFilterVon("");
    setFilterBis("");
    setFilterKw("");
    setFilterKunde("");
    setTouren([]);
    setStoppsMap({});
    setMsg("");
  }

  async function toggleStopps(tourId) {
    if (stoppsMap[tourId]) {
      // einklappen
      setStoppsMap((m) => {
        const copy = { ...m };
        delete copy[tourId];
        return copy;
      });
      return;
    }
    // laden und ausklappen
    try {
      const s = await api.getStoppsByTour(tourId);
      setStoppsMap((m) => ({ ...m, [tourId]: s }));
      // Edit-Stati vorbereiten
      const st = {};
      for (const item of s) {
        st[item.id] = {
          position: item.position ?? "",
          kunde: item.kunde ?? "",
          adresse: item.adresse ?? "",
          telefon: item.telefon ?? "",
          kommission: item.kommission ?? "",
          hinweis: item.hinweis ?? "",
        };
      }
      setEditStopp((prev) => ({ ...prev, ...st }));
    } catch (e) {
      alert("Stopps konnten nicht geladen werden.");
    }
  }

  // ---- Tour bearbeiten (inline oben)
  function startEditTour(t) {
    setEditTour((st) => ({
      ...st,
      [t.id]: { fahrer_id: t.fahrer_id, datum: t.datum, bemerkung: t.bemerkung ?? "" },
    }));
  }
  function cancelEditTour(tid) {
    setEditTour((st) => {
      const c = { ...st };
      delete c[tid];
      return c;
    });
  }
  async function saveEditTour(tid) {
    try {
      const payload = editTour[tid];
      await api.updateTour(tid, payload);
      // Liste neu laden
      await ladeTouren();
      cancelEditTour(tid);
    } catch (e) {
      alert("Tour konnte nicht gespeichert werden.");
    }
  }
  async function deleteTour(tid, stopps_count) {
    const ok = confirm(
      stopps_count && Number(stopps_count) > 0
        ? `Diese Tour hat ${stopps_count} Stopps. Wirklich löschen?`
        : "Tour wirklich löschen?"
    );
    if (!ok) return;
    try {
      await api.deleteTour(tid);
      // aus State entfernen
      setTouren((list) => list.filter((t) => t.id !== tid));
      setStoppsMap((m) => {
        const c = { ...m };
        delete c[tid];
        return c;
      });
    } catch {
      alert("Tour konnte nicht gelöscht werden.");
    }
  }

  // ---- Stopp bearbeiten
  function changeStoppField(stoppId, field, value) {
    setEditStopp((st) => ({ ...st, [stoppId]: { ...st[stoppId], [field]: value } }));
  }
  async function saveStopp(stoppId, tourId) {
    try {
      const payload = editStopp[stoppId];
      await api.updateStopp(stoppId, payload);
      // lokale Liste aktualisieren
      setStoppsMap((m) => ({
        ...m,
        [tourId]: (m[tourId] || []).map((s) => (s.id === stoppId ? { ...s, ...payload } : s)),
      }));
    } catch {
      alert("Stopp konnte nicht gespeichert werden.");
    }
  }
  async function deleteStopp(stoppId, tourId) {
    const ok = confirm("Diesen Stopp wirklich löschen?");
    if (!ok) return;
    try {
      await api.deleteStopp(stoppId);
      setStoppsMap((m) => ({
        ...m,
        [tourId]: (m[tourId] || []).filter((s) => s.id !== stoppId),
      }));
    } catch {
      alert("Stopp konnte nicht gelöscht werden.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0058A3]">Tourverwaltung</h1>

      {/* Filter */}
      <section className="bg-white p-4 rounded-lg shadow space-y-3">
        <h2 className="text-lg font-medium text-[#0058A3]">Filter</h2>
        <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-3">
          <div>
            <label className="text-sm text-gray-600 block">Fahrer</label>
            <select
              className="border rounded-md px-3 py-2 w-full"
              value={filterFahrer}
              onChange={(e) => setFilterFahrer(e.target.value)}
            >
              <option value="">Alle Fahrer</option>
              {fahrer.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block">Datum von</label>
            <input
              type="date"
              className="border rounded-md px-3 py-2 w-full"
              value={filterVon}
              onChange={(e) => setFilterVon(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block">Datum bis</label>
            <input
              type="date"
              className="border rounded-md px-3 py-2 w-full"
              value={filterBis}
              onChange={(e) => setFilterBis(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block">Kalenderwoche</label>
            <input
              type="week"
              className="border rounded-md px-3 py-2 w-full"
              value={filterKw}
              onChange={(e) => setFilterKw(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block">Kunde</label>
            <input
              type="text"
              className="border rounded-md px-3 py-2 w-full"
              placeholder="Kundenname…"
              value={filterKunde}
              onChange={(e) => setFilterKunde(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={ladeTouren}
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

      {/* Tabelle Touren */}
      <section className="bg-white p-4 rounded-lg shadow space-y-3">
        <h2 className="text-lg font-medium text-[#0058A3]">Touren</h2>

        {loading && <div className="text-gray-500">Laden…</div>}
        {!loading && msg && <div className="text-gray-600">{msg}</div>}

        {!loading && touren.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-[#0058A3] text-white">
                <tr>
                  <th className="border px-2 py-1 text-left">Datum</th>
                  <th className="border px-2 py-1 text-left">Fahrer</th>
                  <th className="border px-2 py-1 text-left">Stopps</th>
                  <th className="border px-2 py-1 text-left">Kunden (Auszug)</th>
                  <th className="border px-2 py-1 text-left">Bemerkung</th>
                  <th className="border px-2 py-1 text-left">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {touren.map((t) => {
                  const isEdit = !!editTour[t.id];
                  return (
                    <React.Fragment key={t.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="border px-2 py-1">
                          {isEdit ? (
                            <input
                              type="date"
                              className="border rounded px-2 py-1"
                              value={editTour[t.id].datum || ""}
                              onChange={(e) =>
                                setEditTour((st) => ({
                                  ...st,
                                  [t.id]: { ...st[t.id], datum: e.target.value },
                                }))
                              }
                            />
                          ) : (
                            fmt(t.datum)
                          )}
                        </td>
                        <td className="border px-2 py-1">
                          {isEdit ? (
                            <select
                              className="border rounded px-2 py-1"
                              value={editTour[t.id].fahrer_id || ""}
                              onChange={(e) =>
                                setEditTour((st) => ({
                                  ...st,
                                  [t.id]: { ...st[t.id], fahrer_id: Number(e.target.value) },
                                }))
                              }
                            >
                              {fahrer.map((f) => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                          ) : (
                            t.fahrer_name
                          )}
                        </td>
                        <td className="border px-2 py-1">{t.stopps_count}</td>
                        <td className="border px-2 py-1">{t.kunden_preview || "–"}</td>
                        <td className="border px-2 py-1">
                          {isEdit ? (
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-64"
                              value={editTour[t.id].bemerkung || ""}
                              onChange={(e) =>
                                setEditTour((st) => ({
                                  ...st,
                                  [t.id]: { ...st[t.id], bemerkung: e.target.value },
                                }))
                              }
                            />
                          ) : (
                            t.bemerkung || <span className="text-gray-400">–</span>
                          )}
                        </td>
                        <td className="border px-2 py-1">
                          {!isEdit ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                onClick={() => toggleStopps(t.id)}
                              >
                                {stoppsMap[t.id] ? "Stopps ausblenden" : "Stopps anzeigen"}
                              </button>
                              <button
                                className="px-3 py-1 rounded bg-yellow-200 hover:bg-yellow-300"
                                onClick={() => startEditTour(t)}
                              >
                                ✏️ Bearbeiten
                              </button>
                              <button
                                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                                onClick={() => deleteTour(t.id, t.stopps_count)}
                              >
                                🗑️ Tour löschen
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="px-3 py-1 rounded bg-[#0058A3] text-white hover:bg-blue-800"
                                onClick={() => saveEditTour(t.id)}
                              >
                                💾 Speichern
                              </button>
                              <button
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                onClick={() => cancelEditTour(t.id)}
                              >
                                Abbrechen
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Untertabelle Stopps */}
                      {stoppsMap[t.id] && (
                        <tr>
                          <td className="border px-2 py-2 bg-gray-50" colSpan={6}>
                            <div className="overflow-x-auto">
                              <table className="min-w-full border text-sm">
                                <thead className="bg-gray-200">
                                  <tr>
                                    <th className="border px-2 py-1 text-left">Pos</th>
                                    <th className="border px-2 py-1 text-left">Kunde</th>
                                    <th className="border px-2 py-1 text-left">Adresse</th>
                                    <th className="border px-2 py-1 text-left">Telefon</th>
                                    <th className="border px-2 py-1 text-left">Kommission</th>
                                    <th className="border px-2 py-1 text-left">Hinweis</th>
                                    <th className="border px-2 py-1 text-left">Aktionen</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {stoppsMap[t.id].length === 0 && (
                                    <tr>
                                      <td colSpan={7} className="text-center py-2 text-gray-500">
                                        Keine Stopps
                                      </td>
                                    </tr>
                                  )}
                                  {stoppsMap[t.id].map((s) => {
                                    const ed = editStopp[s.id] || {};
                                    return (
                                      <tr key={s.id} className="hover:bg-white">
                                        <td className="border px-2 py-1 w-16">
                                          <input
                                            type="number"
                                            className="border rounded px-2 py-1 w-full"
                                            value={ed.position ?? ""}
                                            onChange={(e) =>
                                              changeStoppField(s.id, "position", e.target.value === "" ? null : Number(e.target.value))
                                            }
                                          />
                                        </td>
                                        <td className="border px-2 py-1 w-56">
                                          <input
                                            type="text"
                                            className="border rounded px-2 py-1 w-full"
                                            value={ed.kunde ?? ""}
                                            onChange={(e) => changeStoppField(s.id, "kunde", e.target.value)}
                                          />
                                        </td>
                                        <td className="border px-2 py-1 w-72">
                                          <input
                                            type="text"
                                            className="border rounded px-2 py-1 w-full"
                                            value={ed.adresse ?? ""}
                                            onChange={(e) => changeStoppField(s.id, "adresse", e.target.value)}
                                          />
                                        </td>
                                        <td className="border px-2 py-1 w-48">
                                          <input
                                            type="text"
                                            className="border rounded px-2 py-1 w-full"
                                            value={ed.telefon ?? ""}
                                            onChange={(e) => changeStoppField(s.id, "telefon", e.target.value)}
                                          />
                                        </td>
                                        <td className="border px-2 py-1 w-48">
                                          <input
                                            type="text"
                                            className="border rounded px-2 py-1 w-full"
                                            value={ed.kommission ?? ""}
                                            onChange={(e) => changeStoppField(s.id, "kommission", e.target.value)}
                                          />
                                        </td>
                                        <td className="border px-2 py-1 w-72">
                                          <input
                                            type="text"
                                            className="border rounded px-2 py-1 w-full"
                                            value={ed.hinweis ?? ""}
                                            onChange={(e) => changeStoppField(s.id, "hinweis", e.target.value)}
                                          />
                                        </td>
                                        <td className="border px-2 py-1">
                                          <div className="flex gap-2">
                                            <button
                                              className="px-3 py-1 rounded bg-[#0058A3] text-white hover:bg-blue-800"
                                              onClick={() => saveStopp(s.id, t.id)}
                                            >
                                              💾 Speichern
                                            </button>
                                            <button
                                              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                                              onClick={() => deleteStopp(s.id, t.id)}
                                            >
                                              🗑️ Löschen
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
