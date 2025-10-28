import React, { useEffect, useState } from "react";
import { api } from "../api";
import MapView from "../components/MapView";

export default function Tagestour() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState("");
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meldung, setMeldung] = useState("");

  // Fahrer laden
  useEffect(() => {
    api
      .listFahrer()
      .then(setFahrer)
      .catch(() => setMeldung("❌ Fehler beim Laden der Fahrer."));
  }, []);

  // Tour laden
  async function ladeTour() {
    if (!selectedFahrer || !datum) {
      setMeldung("❌ Bitte Fahrer und Datum wählen.");
      return;
    }
    setMeldung("");
    setLoading(true);
    try {
      const res = await api.getTourByFahrerUndDatum(selectedFahrer, datum);
      if (!res.tour) {
        setTour(null);
        setStopps([]);
        setMeldung("ℹ️ Keine Tour für diesen Tag gefunden.");
      } else {
        setTour(res.tour);
        setStopps(res.stopps || []);
        setMeldung("");
      }
    } catch (err) {
      console.error(err);
      setMeldung("❌ Fehler beim Laden der Tour.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0058A3]">Tagestour</h1>

      {/* Auswahlbereich */}
      <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Fahrer</label>
          <select
            value={selectedFahrer}
            onChange={(e) => setSelectedFahrer(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          >
            <option value="">– bitte wählen –</option>
            {fahrer.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Datum</label>
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={ladeTour}
            disabled={loading}
            className="w-full bg-[#0058A3] text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition disabled:opacity-60"
          >
            {loading ? "Lädt ..." : "Tour laden"}
          </button>
        </div>
      </div>

      {/* Meldungen */}
      {meldung && (
        <div
          className={`px-4 py-3 rounded-md text-sm shadow ${
            meldung.startsWith("❌")
              ? "bg-red-50 border border-red-300 text-red-700"
              : "bg-blue-50 border border-blue-300 text-blue-700"
          }`}
        >
          {meldung}
        </div>
      )}

      {/* Stopp-Tabelle */}
      {tour && stopps.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#0058A3] text-white">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Kunde</th>
                <th className="px-3 py-2 text-left">Adresse</th>
                <th className="px-3 py-2 text-left">Kommission</th>
                <th className="px-3 py-2 text-left">Hinweis</th>
                <th className="px-3 py-2 text-left">Telefon</th>
              </tr>
            </thead>
            <tbody>
              {stopps.map((s, i) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{s.kunde}</td>
                  <td className="px-3 py-2">{s.adresse}</td>
                  <td className="px-3 py-2">{s.kommission}</td>
                  <td className="px-3 py-2">{s.hinweis}</td>
                  <td className="px-3 py-2">
                    {s.telefon ? (
                      <a
                        href={`tel:${s.telefon}`}
                        className="text-blue-600 hover:underline"
                      >
                        {s.telefon}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Karte */}
      {tour && stopps.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <MapView stopps={stopps} />
        </div>
      )}

      {!tour && !meldung && (
        <p className="text-gray-500 italic">
          Bitte Fahrer und Datum wählen, um die Tagestour zu laden.
        </p>
      )}
    </div>
  );
}
