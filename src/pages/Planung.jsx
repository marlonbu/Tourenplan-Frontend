import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const fmtISO = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function Planung() {
  const [fahrer, setFahrer] = useState([]);
  const [fahrerId, setFahrerId] = useState("");
  const [datum, setDatum] = useState(fmtISO());
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Felder für neuen Stopp
  const [neu, setNeu] = useState({
    kunde: "",
    adresse: "",
    telefon: "",
    hinweis: "",
    position: 0,
  });

  // Fahrer laden
  useEffect(() => {
    api.listFahrer()
      .then(setFahrer)
      .catch(() => setMsg("❌ Fehler beim Laden der Fahrer"));
  }, []);

  const fahrerName = useMemo(
    () => fahrer.find((f) => String(f.id) === String(fahrerId))?.name || "",
    [fahrer, fahrerId]
  );

  const loadTour = async () => {
    if (!fahrerId || !datum) return;
    setLoading(true);
    setMsg("");
    try {
      const data = await api.getTour(fahrerId, datum);
      setTour(data.tour);
      setStopps(data.stopps || []);
      if (!data.tour) setMsg("ℹ️ Noch keine Tour für die Auswahl vorhanden.");
    } catch {
      setMsg("❌ Fehler beim Laden der Tour");
    } finally {
      setLoading(false);
    }
  };

  const createTour = async () => {
    if (!fahrerId || !datum) { setMsg("⚠️ Fahrer & Datum wählen"); return; }
    setMsg("");
    try {
      const t = await api.createTour(Number(fahrerId), datum);
      setTour(t);
      setStopps([]);
      setMsg("✅ Tour angelegt / geladen");
    } catch {
      setMsg("❌ Fehler beim Anlegen der Tour");
    }
  };

  const addStopp = async () => {
    if (!tour?.id) { setMsg("⚠️ Bitte zuerst Tour anlegen"); return; }
    if (!neu.kunde.trim() || !neu.adresse.trim()) {
      setMsg("⚠️ Kunde & Adresse erforderlich");
      return;
    }
    try {
      const s = await api.addStopp(tour.id, {
        kunde: neu.kunde,
        adresse: neu.adresse,
        telefon: neu.telefon,
        hinweis: neu.hinweis,
        position: Number(neu.position) || 0,
      });
      setStopps((prev) => [...prev, s].sort((a,b) => (a.position ?? 0) - (b.position ?? 0)));
      setNeu({ kunde: "", adresse: "", telefon: "", hinweis: "", position: 0 });
      setMsg("✅ Stopp hinzugefügt");
    } catch {
      setMsg("❌ Fehler beim Hinzufügen des Stopps");
    }
  };

  const deleteStopp = async (id) => {
    try {
      await api.deleteStopp(id);
      setStopps((prev) => prev.filter((s) => s.id !== id));
      setMsg("🗑️ Stopp gelöscht");
    } catch {
      setMsg("❌ Fehler beim Löschen des Stopps");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0058A3]">Planung</h1>

      {/* Auswahl */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm text-gray-600">Fahrer</label>
            <select
              value={fahrerId}
              onChange={(e) => setFahrerId(e.target.value)}
              className="mt-1 border rounded-md px-3 py-2 w-full"
            >
              <option value="">Fahrer wählen</option>
              {fahrer.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Datum</label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="mt-1 border rounded-md px-3 py-2 w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={createTour}
              className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition w-full"
            >
              Tour anlegen
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadTour}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition w-full"
            >
              Tour laden
            </button>
          </div>
        </div>
      </div>

      {/* Neue Stopps */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-[#0058A3] mb-4">Stopp hinzufügen</h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Kunde</label>
            <input
              className="mt-1 border rounded-md px-3 py-2 w-full"
              value={neu.kunde}
              onChange={(e) => setNeu({ ...neu, kunde: e.target.value })}
              placeholder="Kundenname"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Adresse</label>
            <input
              className="mt-1 border rounded-md px-3 py-2 w-full"
              value={neu.adresse}
              onChange={(e) => setNeu({ ...neu, adresse: e.target.value })}
              placeholder="Straße Hausnr., PLZ Ort"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Telefon</label>
            <input
              className="mt-1 border rounded-md px-3 py-2 w-full"
              value={neu.telefon}
              onChange={(e) => setNeu({ ...neu, telefon: e.target.value })}
              placeholder="z. B. 054xx …"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Position</label>
            <input
              type="number"
              className="mt-1 border rounded-md px-3 py-2 w-full"
              value={neu.position}
              onChange={(e) => setNeu({ ...neu, position: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="md:col-span-6">
            <label className="text-sm text-gray-600">Hinweis</label>
            <input
              className="mt-1 border rounded-md px-3 py-2 w-full"
              value={neu.hinweis}
              onChange={(e) => setNeu({ ...neu, hinweis: e.target.value })}
              placeholder="z. B. Tor 3, vormittags"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={addStopp}
            className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Stopp hinzufügen
          </button>
        </div>
      </div>

      {/* Stoppliste */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#0058A3]">
            {tour ? `Tour #${tour.id} – ${fahrerName} (${datum})` : "Keine Tour geladen"}
          </h2>
          {loading && <span className="text-sm text-gray-500">Laden…</span>}
        </div>

        {stopps.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine Stopps vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#0058A3] text-white">
                  <th className="px-3 py-2 text-left">Pos</th>
                  <th className="px-3 py-2 text-left">Kunde</th>
                  <th className="px-3 py-2 text-left">Adresse</th>
                  <th className="px-3 py-2 text-left">Telefon</th>
                  <th className="px-3 py-2 text-left">Hinweis</th>
                  <th className="px-3 py-2 text-left">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s) => (
                  <tr key={s.id} className="odd:bg-gray-50">
                    <td className="px-3 py-2">{s.position ?? 0}</td>
                    <td className="px-3 py-2">{s.kunde}</td>
                    <td className="px-3 py-2">{s.adresse}</td>
                    <td className="px-3 py-2">
                      {s.telefon ? (
                        <a className="text-[#0058A3] underline" href={`tel:${s.telefon}`}>{s.telefon}</a>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2">{s.hinweis || "—"}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => deleteStopp(s.id)}
                        className="text-red-600 hover:underline"
                        title="Löschen"
                      >
                        Löschen 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`px-4 py-3 rounded-md text-sm ${
            msg.startsWith("❌") || msg.startsWith("⚠️")
              ? "bg-red-50 border border-red-300 text-red-700"
              : "bg-green-50 border border-green-300 text-green-700"
          }`}
        >
          {msg}
        </div>
      )}
    </div>
  );
}
