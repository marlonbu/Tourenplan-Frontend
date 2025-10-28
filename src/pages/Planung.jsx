// src/pages/Planung.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

// kleines Datumsformat ISO (yyyy-mm-dd)
const fmtISO = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function Planung() {
  // Fahrer
  const [fahrer, setFahrer] = useState([]);
  const [neuerFahrer, setNeuerFahrer] = useState("");

  // Auswahl
  const [fahrerId, setFahrerId] = useState("");
  const [datum, setDatum] = useState(fmtISO());

  // Tour + Stopps
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);

  // UI
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Stopp-Form
  const [neu, setNeu] = useState({
    kunde: "",
    adresse: "",
    telefon: "",
    hinweis: "",
    position: 0,
  });

  const fahrerName = useMemo(
    () => fahrer.find((f) => String(f.id) === String(fahrerId))?.name || "",
    [fahrer, fahrerId]
  );

  // -------- Fahrer laden ----------
  const loadFahrer = async () => {
    setMsg("");
    try {
      const list = await api.listFahrer();
      setFahrer(list || []);
    } catch {
      setMsg("❌ Fehler beim Laden der Fahrer");
    }
  };

  useEffect(() => {
    loadFahrer();
  }, []);

  // -------- Fahrer hinzufügen ----------
  const addFahrer = async () => {
    setMsg("");
    const name = (neuerFahrer || "").trim();
    if (!name) {
      setMsg("⚠️ Bitte einen Fahrernamen eingeben");
      return;
    }
    try {
      await api.addFahrer(name);
      setNeuerFahrer("");
      await loadFahrer();
      setMsg("✅ Fahrer hinzugefügt");
    } catch {
      setMsg("❌ Fehler beim Hinzufügen des Fahrers");
    }
  };

  // -------- Fahrer löschen ----------
  const deleteFahrer = async (id) => {
    if (!window.confirm("Fahrer wirklich löschen?")) return;
    setMsg("");
    try {
      await api.deleteFahrer(id);
      await loadFahrer();
      // falls gelöschter Fahrer ausgewählt war -> Auswahl leeren
      if (String(fahrerId) === String(id)) {
        setFahrerId("");
        setTour(null);
        setStopps([]);
      }
      setMsg("🗑️ Fahrer gelöscht");
    } catch {
      setMsg("❌ Fehler beim Löschen des Fahrers");
    }
  };

  // -------- Tour laden / anlegen ----------
  const loadTour = async () => {
    if (!fahrerId || !datum) {
      setMsg("⚠️ Bitte Fahrer & Datum wählen");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const data = await api.getTour(fahrerId, datum);
      setTour(data?.tour || null);
      setStopps(data?.stopps || []);
      if (!data?.tour) setMsg("ℹ️ Noch keine Tour für die Auswahl vorhanden.");
    } catch {
      setMsg("❌ Fehler beim Laden der Tour");
    } finally {
      setLoading(false);
    }
  };

  const createTour = async () => {
    if (!fahrerId || !datum) {
      setMsg("⚠️ Bitte Fahrer & Datum wählen");
      return;
    }
    setMsg("");
    try {
      const t = await api.createTour(Number(fahrerId), datum);
      setTour(t || null);
      setStopps([]);
      setMsg("✅ Tour angelegt / geladen");
    } catch {
      setMsg("❌ Fehler beim Anlegen der Tour");
    }
  };

  // -------- Stopp hinzufügen / löschen ----------
  const addStopp = async () => {
    if (!tour?.id) {
      setMsg("⚠️ Bitte zuerst eine Tour anlegen oder laden");
      return;
    }
    if (!neu.kunde.trim() || !neu.adresse.trim()) {
      setMsg("⚠️ Kunde & Adresse sind Pflicht");
      return;
    }
    setMsg("");
    try {
      const s = await api.addStopp(tour.id, {
        kunde: neu.kunde,
        adresse: neu.adresse,
        telefon: neu.telefon,
        hinweis: neu.hinweis,
        position: Number(neu.position) || 0,
      });
      setStopps((prev) => [...prev, s].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
      setNeu({ kunde: "", adresse: "", telefon: "", hinweis: "", position: 0 });
      setMsg("✅ Stopp hinzugefügt");
    } catch {
      setMsg("❌ Fehler beim Hinzufügen des Stopps");
    }
  };

  const removeStopp = async (id) => {
    setMsg("");
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
      <h1 className="text-2xl font-bold text-[#0B5EA8]">Planung</h1>

      {/* Fahrer verwalten */}
      <div className="bg-white p-5 rounded-lg shadow border">
        <h2 className="text-lg font-semibold text-[#0B5EA8] mb-3">Fahrer verwalten</h2>

        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            className="border rounded-md px-3 py-2 w-full md:w-1/2"
            placeholder="Neuer Fahrername"
            value={neuerFahrer} // fallback falls Tippfehler in älterer Datei
            onChange={(e) => setNeuerFahrer(e.target.value)}
          />
          <button
            onClick={addFahrer}
            className="bg-[#0B5EA8] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Fahrer hinzufügen
          </button>
        </div>

        {fahrer.length > 0 && (
          <table className="min-w-full text-sm mt-4 border">
            <thead className="bg-[#0B5EA8] text-white">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left w-32">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {fahrer.map((f) => (
                <tr key={f.id} className="odd:bg-gray-50">
                  <td className="px-3 py-2">{f.name}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => deleteFahrer(f.id)}
                      className="text-red-600 hover:underline"
                      title="Fahrer löschen"
                    >
                      Löschen 🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tour-Header */}
      <div className="bg-white p-5 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm text-gray-600">Fahrer</label>
            <select
              className="w-full border rounded-md px-3 py-2 mt-1"
              value={fahrerId}
              onChange={(e) => setFahrerId(e.target.value)}
            >
              <option value="">Fahrer wählen</option>
              {fahrer.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Datum</label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2 mt-1"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
            />
          </div>

          <button
            onClick={createTour}
            className="bg-[#0B5EA8] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Tour anlegen
          </button>

          <button
            onClick={loadTour}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Tour laden
          </button>
        </div>
      </div>

      {/* Stopp hinzufügen */}
      <div className="bg-white p-5 rounded-lg shadow border">
        <h3 className="font-semibold text-[#0B5EA8] mb-3">Stopp hinzufügen</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Kundenname"
            value={neu.kunde}
            onChange={(e) => setNeu({ ...neu, kunde: e.target.value })}
          />
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Straße Hausnr., PLZ Ort"
            value={neu.adresse}
            onChange={(e) => setNeu({ ...neu, adresse: e.target.value })}
          />
          <input
            className="border rounded-md px-3 py-2"
            placeholder="z. B. 054xx …"
            value={neu.telefon}
            onChange={(e) => setNeu({ ...neu, telefon: e.target.value })}
          />
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Position"
            type="number"
            value={neu.position}
            onChange={(e) => setNeu({ ...neu, position: e.target.value })}
          />
          <button
            onClick={addStopp}
            className="bg-[#0B5EA8] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Stopp hinzufügen
          </button>
        </div>
        <input
          className="border rounded-md px-3 py-2 w-full mt-3"
          placeholder="Hinweis (optional)"
          value={neu.hinweis}
          onChange={(e) => setNeu({ ...neu, hinweis: e.target.value })}
        />
      </div>

      {/* Stopp-Liste */}
      <div className="bg-white p-5 rounded-lg shadow border">
        <h3 className="font-semibold text-[#0B5EA8] mb-3">
          {tour?.id ? `Tour #${tour.id} • ${fahrerName} • ${datum}` : "Keine Tour geladen"}
        </h3>
        {stopps.length === 0 ? (
          <div className="text-sm text-gray-600">Noch keine Stopps vorhanden.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-[#0B5EA8] text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Pos</th>
                  <th className="px-3 py-2 text-left">Kunde</th>
                  <th className="px-3 py-2 text-left">Adresse</th>
                  <th className="px-3 py-2 text-left">Telefon</th>
                  <th className="px-3 py-2 text-left">Hinweis</th>
                  <th className="px-3 py-2 text-left w-28">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {stopps
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((s) => (
                    <tr key={s.id} className="odd:bg-gray-50">
                      <td className="px-3 py-2">{s.position ?? 0}</td>
                      <td className="px-3 py-2">{s.kunde}</td>
                      <td className="px-3 py-2">{s.adresse}</td>
                      <td className="px-3 py-2">
                        {s.telefon ? (
                          <a className="text-[#0B5EA8] hover:underline" href={`tel:${s.telefon}`}>
                            {s.telefon}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2">{s.hinweis || "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeStopp(s.id)}
                          className="text-red-600 hover:underline"
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

      {/* Meldungen */}
      {msg && (
        <div
          className={`p-3 rounded-md ${
            msg.startsWith("❌") ? "bg-red-50 text-red-700 border border-red-200" :
            msg.startsWith("🗑️") || msg.startsWith("✅") || msg.startsWith("ℹ️") || msg.startsWith("⚠️")
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-gray-50 text-gray-700 border"
          }`}
        >
          {msg}
        </div>
      )}

      {loading && <div className="text-sm text-gray-600">⏳ Lade…</div>}
    </div>
  );
}
