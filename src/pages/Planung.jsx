import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Planung() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState("");
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [neuerStopp, setNeuerStopp] = useState({
    kunde: "",
    adresse: "",
    kommission: "",
    hinweis: "",
    telefon: "",
    position: "",
  });
  const [loading, setLoading] = useState(false);
  const [meldung, setMeldung] = useState("");

  // Fahrer laden
  useEffect(() => {
    api
      .listFahrer()
      .then(setFahrer)
      .catch(() => setMeldung("Fehler beim Laden der Fahrer"));
  }, []);

  // Tour laden, wenn Fahrer & Datum gewählt
  useEffect(() => {
    if (!selectedFahrer || !datum) return;
    async function loadTour() {
      setLoading(true);
      try {
        const t = await api.getTourByFahrerUndDatum(selectedFahrer, datum);
        setTour(t.tour);
        setStopps(t.stopps || []);
      } catch {
        setTour(null);
        setStopps([]);
      } finally {
        setLoading(false);
      }
    }
    loadTour();
  }, [selectedFahrer, datum]);

  // Neue Tour anlegen
  async function anlegen() {
    if (!selectedFahrer || !datum) {
      setMeldung("Bitte Fahrer und Datum wählen.");
      return;
    }
    setLoading(true);
    try {
      const t = await api.createTour({ fahrer_id: selectedFahrer, datum });
      setTour(t.tour);
      setMeldung("Neue Tour angelegt.");
    } catch {
      setMeldung("Fehler beim Anlegen der Tour.");
    } finally {
      setLoading(false);
    }
  }

  // Stopp hinzufügen
  async function stoppHinzufuegen() {
    if (!tour) {
      setMeldung("Bitte zuerst eine Tour anlegen.");
      return;
    }
    if (!neuerStopp.kunde || !neuerStopp.adresse) {
      setMeldung("Bitte mindestens Kunde und Adresse angeben.");
      return;
    }
    setLoading(true);
    try {
      const s = await api.createStopp({
        tour_id: tour.id,
        ...neuerStopp,
      });
      setStopps((prev) => [...prev, s]);
      setNeuerStopp({
        kunde: "",
        adresse: "",
        kommission: "",
        hinweis: "",
        telefon: "",
        position: "",
      });
      setMeldung("Stopp hinzugefügt.");
    } catch {
      setMeldung("Fehler beim Hinzufügen des Stopps.");
    } finally {
      setLoading(false);
    }
  }

  // Stopp löschen
  async function stoppLoeschen(id) {
    if (!window.confirm("Diesen Stopp wirklich löschen?")) return;
    try {
      await api.deleteStopp(id);
      setStopps((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setMeldung("Fehler beim Löschen des Stopps.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0058A3]">Tourenplanung</h1>

      {/* Auswahl */}
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
            onClick={anlegen}
            className="bg-[#0058A3] text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition w-full"
          >
            Tour anlegen
          </button>
        </div>
      </div>

      {/* Neue Stopps */}
      {tour && (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0058A3]">
            Stopps hinzufügen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {["kunde", "adresse", "kommission", "hinweis", "telefon", "position"].map(
              (field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={neuerStopp[field]}
                  onChange={(e) =>
                    setNeuerStopp({ ...neuerStopp, [field]: e.target.value })
                  }
                  className="border rounded-md px-3 py-2 w-full text-sm"
                />
              )
            )}
          </div>
          <button
            onClick={stoppHinzufuegen}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            ➕ Stopp hinzufügen
          </button>
        </div>
      )}

      {/* Meldung */}
      {meldung && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded">
          {meldung}
        </div>
      )}

      {/* Tabelle */}
      {stopps.length > 0 && (
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
                <th className="px-3 py-2 text-left">Position</th>
                <th className="px-3 py-2 text-center">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {stopps.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{r.kunde}</td>
                  <td className="px-3 py-2">{r.adresse}</td>
                  <td className="px-3 py-2">{r.kommission}</td>
                  <td className="px-3 py-2">{r.hinweis}</td>
                  <td className="px-3 py-2">
                    {r.telefon ? (
                      <a
                        href={`tel:${r.telefon}`}
                        className="text-blue-600 hover:underline"
                      >
                        {r.telefon}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2">{r.position}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => stoppLoeschen(r.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !tour && (
        <p className="text-gray-500 italic">
          Bitte Fahrer und Datum wählen, um Tour zu laden oder anzulegen.
        </p>
      )}
    </div>
  );
}
