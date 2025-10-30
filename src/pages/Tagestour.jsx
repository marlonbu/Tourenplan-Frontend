import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Tagestour() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    ladeFahrer();
  }, []);

  async function ladeFahrer() {
    try {
      const data = await api.listFahrer();
      setFahrer(data);
    } catch (err) {
      console.error("Fehler beim Laden der Fahrer:", err);
      setMsg("❌ Fahrer konnten nicht geladen werden");
    }
  }

  async function ladeTour() {
    if (!selectedFahrer || !datum) {
      alert("Bitte Fahrer und Datum auswählen!");
      return;
    }
    try {
      const data = await api.getTour(selectedFahrer, datum);
      setTour(data.tour);
      setStopps(data.stopps || []);
      setMsg(data.tour ? "✅ Tour geladen" : "ℹ️ Keine Tour gefunden");
    } catch (err) {
      console.error("Fehler:", err);
      setMsg("❌ Tour konnte nicht geladen werden");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0058A3]">Tagestour</h1>

      <section className="bg-white p-4 rounded-lg shadow space-y-3">
        <h2 className="text-lg font-medium text-[#0058A3]">Tour laden</h2>

        {msg && <div className="text-sm text-gray-600">{msg}</div>}

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-sm text-gray-600 block">Fahrer</label>
            <select
              className="border rounded-md px-3 py-2"
              value={selectedFahrer}
              onChange={(e) => setSelectedFahrer(e.target.value)}
            >
              <option value="">– Fahrer auswählen –</option>
              {fahrer.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 block">Datum</label>
            <input
              type="date"
              className="border rounded-md px-3 py-2"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
            />
          </div>

          <button
            onClick={ladeTour}
            className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Tour laden
          </button>
        </div>

        {tour && (
          <div className="mt-4 text-sm text-gray-700">
            <div>
              <b>Tour-ID:</b> {tour.id}
            </div>
            <div>
              <b>Fahrer:</b> {fahrer.find((f) => f.id === tour.fahrer_id)?.name}
            </div>
            <div>
              <b>Datum:</b> {tour.datum}
            </div>
          </div>
        )}
      </section>

      {tour && (
        <section className="bg-white p-4 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-medium text-[#0058A3]">
            Stopps dieser Tour
          </h2>

          <table className="min-w-full border text-sm">
            <thead className="bg-[#0058A3] text-white">
              <tr>
                <th className="border px-2 py-1">Pos</th>
                <th className="border px-2 py-1">Kunde</th>
                <th className="border px-2 py-1">Adresse</th>
                <th className="border px-2 py-1">Telefon</th>
                <th className="border px-2 py-1">Kommission</th>
                <th className="border px-2 py-1">Hinweis</th>
              </tr>
            </thead>
            <tbody>
              {stopps.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-2 text-gray-500 italic"
                  >
                    Keine Stopps vorhanden
                  </td>
                </tr>
              )}
              {stopps.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 text-center">{s.position}</td>
                  <td className="border px-2 py-1">{s.kunde}</td>
                  <td className="border px-2 py-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        s.adresse || ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {s.adresse}
                    </a>
                  </td>
                  <td className="border px-2 py-1">{s.telefon}</td>
                  <td className="border px-2 py-1">{s.kommission}</td>
                  <td className="border px-2 py-1">{s.hinweis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
