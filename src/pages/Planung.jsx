import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Planung() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [newFahrer, setNewFahrer] = useState("");
  const [meldung, setMeldung] = useState("");

  // Fahrer laden
  const ladeFahrer = async () => {
    try {
      const data = await api.listFahrer();
      setFahrer(data);
    } catch (err) {
      console.error(err);
      setMeldung("❌ Fehler beim Laden der Fahrer");
    }
  };

  useEffect(() => {
    ladeFahrer();
  }, []);

  // Fahrer hinzufügen
  const addFahrer = async () => {
    if (!newFahrer.trim()) return;
    try {
      await api.addFahrer(newFahrer);
      setNewFahrer("");
      setMeldung("✅ Fahrer hinzugefügt");
      ladeFahrer();
    } catch {
      setMeldung("❌ Fehler beim Hinzufügen");
    }
  };

  // Fahrer löschen
  const deleteFahrer = async () => {
    if (!selectedFahrer) return;
    if (!window.confirm("Fahrer wirklich löschen?")) return;
    try {
      await api.deleteFahrer(selectedFahrer);
      setSelectedFahrer("");
      setMeldung("✅ Fahrer gelöscht");
      ladeFahrer();
    } catch {
      setMeldung("❌ Fehler beim Löschen");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0058A3]">Tourenplanung</h1>

      {/* Fahrer bearbeiten */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-[#0058A3]">Fahrer bearbeiten</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ➕ Fahrer hinzufügen */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Neuer Fahrername"
              value={newFahrer}
              onChange={(e) => setNewFahrer(e.target.value)}
              className="border rounded-md px-3 py-2 w-full"
            />
            <button
              onClick={addFahrer}
              className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition"
            >
              ➕
            </button>
          </div>

          {/* 🗑️ Fahrer löschen */}
          <div className="flex gap-2 items-center">
            <select
              value={selectedFahrer}
              onChange={(e) => setSelectedFahrer(e.target.value)}
              className="border rounded-md px-3 py-2 w-full"
            >
              <option value="">– Fahrer auswählen –</option>
              {fahrer.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <button
              onClick={deleteFahrer}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Platzhalter für Tour-Planung */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-[#0058A3]">Tour anlegen</h2>
        <p className="text-sm text-gray-500 italic">
          (Hier kannst du später Stopps hinzufügen und Touren planen.)
        </p>
      </div>

      {meldung && (
        <div
          className={`px-4 py-3 rounded-md text-sm ${
            meldung.startsWith("❌")
              ? "bg-red-50 border border-red-300 text-red-700"
              : "bg-green-50 border border-green-300 text-green-700"
          }`}
        >
          {meldung}
        </div>
      )}
    </div>
  );
}
