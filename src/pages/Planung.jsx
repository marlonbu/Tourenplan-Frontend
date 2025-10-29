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

  const [neu, setNeu] = useState({
    kunde: "",
    adresse: "",
    telefon: "",
    hinweis: "",
    position: 0,
  });

  const [neuerFahrer, setNeuerFahrer] = useState("");

  // Fahrer laden
  const loadFahrer = () => {
    api
      .listFahrer()
      .then(setFahrer)
      .catch(() => setMsg("❌ Fehler beim Laden der Fahrer"));
  };

  useEffect(() => {
    loadFahrer();
  }, []);

  const fahrerName = useMemo(
    () => fahrer.find((f) => String(f.id) === String(fahrerId))?.name || "",
    [fahrer, fahrerId]
  );

  // Fahrer hinzufügen
  const addFahrer = async () => {
    if (!neuerFahrer.trim()) {
      setMsg("⚠️ Bitte Namen eingeben");
      return;
    }
    try {
      await api.addFahrer(neuerFahrer.trim());
      setNeuerFahrer("");
      setMsg("✅ Fahrer hinzugefügt");
      loadFahrer();
    } catch {
      setMsg("❌ Fehler beim Hinzufügen des Fahrers");
    }
  };

  // Fahrer löschen
  const deleteFahrer = async (id) => {
    if (!window.confirm("Fahrer wirklich löschen?")) return;
    try {
      await api.deleteFahrer(id);
      setMsg("🗑️ Fahrer gelöscht");
      loadFahrer();
    } catch {
      setMsg("❌ Fehler beim Löschen des Fahrers");
    }
  };

  // Tour laden
  const loadTour = async () => {
    if (!fahrerId || !datum) return;
    setLoading(true);
    setMsg("");
    try {
      const data = await api.getTour(fahrerId, datum);
      setTour(data.tour || null);
      setStopps(data.stopps || []);
      if (!data.tour) setMsg("ℹ️ Noch keine Tour vorhanden.");
    } catch {
      setMsg("❌ Fehler beim Laden der Tour");
    } finally {
      setLoading(false);
    }
  };

  // Tour anlegen
  const createTour = async () => {
    if (!fahrerId || !datum) {
      setMsg("⚠️ Fahrer & Datum wählen");
      return;
    }
    setMsg("");
    try {
      const t = await api.createTour(Number(fahrerId), datum, []);
      setTour(t);
      setStopps([]);
      setMsg("✅ Tour angelegt");
    } catch (err) {
      console.error(err);
      setMsg("❌ Fehler beim Anlegen der Tour");
    }
  };

  // Stopp hinzufügen
  const addStopp = async () => {
    if (!tour?.id) {
      setMsg("⚠️ Bitte zuerst Tour anlegen");
      return;
    }
    if (!neu.kunde.trim() || !neu.adresse.trim()) {
      setMsg("⚠️ Kunde & Adresse erforderlich");
      return;
    }
    try {
      const s = await api.addStopp(tour.id, neu);
      setStopps((prev) => [...prev, s].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
      setNeu({ kunde: "", adresse: "", telefon: "", hinweis: "", position: 0 });
      setMsg("✅ Stopp hinzugefügt");
    } catch {
      setMsg("❌ Fehler beim Hinzufügen des Stopps");
    }
  };

  // Stopp löschen
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

      {/* Fahrer hinzufügen / löschen */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-[#0058A3] mb-3 flex items-center gap-2">
          👤 Fahrer bearbeiten
        </h2>
        <div className="flex gap-3 mb-4">
          <input
            className="border rounded-md px-3 py-2 flex-1"
            placeholder="Neuer Fahrername"
            value={neuerFahrer}
            onChange={(e) => setNeuerFahrer(e.target.value)}
          />
          <button
            onClick={addFahrer}
            className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
          >
            ➕ Fahrer hinzufügen
          </button>
        </div>

        {fahrer.length === 0 ? (
          <p className="text-sm text-gray-500">Keine Fahrer vorhanden.</p>
        ) : (
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-[#0058A3] text-white">
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Aktionen</th>
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
                    >
                      🗑️ Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Touren anlegen */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-[#0058A3] mb-3">🗓️ Tour planen</h2>
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
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="mt-1 border rounded-md px-3 py-2 w-full"
            />
          </div>
          <button
            onClick={createTour}
            className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
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
