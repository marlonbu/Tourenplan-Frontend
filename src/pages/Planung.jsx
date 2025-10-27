import React, { useState, useEffect } from "react";
import { api } from "../api";

export default function Planung() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(new Date().toISOString().split("T")[0]);
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
  const [message, setMessage] = useState("");

  // Fahrer laden
  useEffect(() => {
    api
      .listFahrer()
      .then((data) => {
        setFahrer(data);
        if (data.length) setSelectedFahrer(String(data[0].id));
      })
      .catch(() => setMessage("Fehler beim Laden der Fahrer"));
  }, []);

  // Tour laden
  async function ladeTour() {
    if (!selectedFahrer || !datum) return;
    try {
      const data = await api.getTourForDay(selectedFahrer, datum);
      setTour(data.tour);
      setStopps(data.stopps);
      setMessage("");
    } catch {
      setTour(null);
      setStopps([]);
      setMessage("Noch keine Tour vorhanden");
    }
  }

  // Tour anlegen
  async function createTour() {
    if (!selectedFahrer || !datum) return;
    try {
      const res = await api.createTour(selectedFahrer, datum);
      setTour(res.tour);
      setMessage("✅ Tour wurde erfolgreich angelegt");
    } catch {
      setMessage("❌ Fehler beim Anlegen der Tour");
    }
  }

  // Stopp hinzufügen
  async function addStopp(e) {
    e.preventDefault();
    if (!tour) {
      setMessage("⚠️ Bitte zuerst eine Tour anlegen");
      return;
    }
    try {
      const res = await api.addStopp(tour.id, neuerStopp);
      setStopps([...stopps, res]);
      setNeuerStopp({
        kunde: "",
        adresse: "",
        kommission: "",
        hinweis: "",
        telefon: "",
        position: "",
      });
      setMessage("✅ Stopp hinzugefügt");
    } catch {
      setMessage("❌ Fehler beim Speichern des Stopps");
    }
  }

  // Stopp löschen
  async function deleteStopp(id) {
    try {
      await api.deleteStopp(id);
      setStopps(stopps.filter((s) => s.id !== id));
      setMessage("🗑️ Stopp gelöscht");
    } catch {
      setMessage("❌ Fehler beim Löschen des Stopps");
    }
  }

  return (
    <div className="space-y-6">
      {/* Kopfbereich */}
      <div className="bg-white shadow rounded-lg p-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Fahrer</label>
          <select
            value={selectedFahrer}
            onChange={(e) => setSelectedFahrer(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
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
            className="border rounded-md px-3 py-2"
          />
        </div>

        <button
          onClick={ladeTour}
          className="bg-[#0058A3] text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition"
        >
          Tour laden
        </button>

        <button
          onClick={createTour}
          className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Neue Tour anlegen
        </button>
      </div>

      {message && (
        <div className="text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded-md">
          {message}
        </div>
      )}

      {/* Stopp hinzufügen */}
      {tour && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#0058A3] mb-4">
            Stopp hinzufügen
          </h2>
          <form onSubmit={addStopp} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Kunde *"
              value={neuerStopp.kunde}
              onChange={(e) =>
                setNeuerStopp({ ...neuerStopp, kunde: e.target.value })
              }
              className="border rounded-md px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Adresse *"
              value={neuerStopp.adresse}
              onChange={(e) =>
                setNeuerStopp({ ...neuerStopp, adresse: e.target.value })
              }
              className="border rounded-md px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Kommission"
              value={neuerStopp.kommission}
              onChange={(e) =>
                setNeuerStopp({ ...neuerStopp, kommission: e.target.value })
              }
              className="border rounded-md px-3 py-2"
            />
            <input
              type="text"
              placeholder="Hinweis"
              value={neuerStopp.hinweis}
              onChange={(e) =>
                setNeuerStopp({ ...neuerStopp, hinweis: e.target.value })
              }
              className="border rounded-md px-3 py-2"
            />
            <input
              type="text"
              placeholder="Telefon"
              value={neuerStopp.telefon}
              onChange={(e) =>
                setNeuerStopp({ ...neuerStopp, telefon: e.target.value })
              }
              className="border rounded-md px-3 py-2"
            />
            <input
              type="number"
              placeholder="Position"
              value={neuerStopp.position}
              onChange={(e) =>
                setNeuerStopp({ ...neuerStopp, position: e.target.value })
              }
              className="border rounded-md px-3 py-2"
            />

            <button
              type="submit"
              className="bg-[#0058A3] text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-800 transition md:col-span-3 lg:col-span-6"
            >
              Stopp speichern
            </button>
          </form>
        </div>
      )}

      {/* Stoppliste */}
      {stopps.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#0058A3] mb-4">
            Aktuelle Stopps
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#0058A3] text-white">
                <tr>
                  <th className="py-2 px-3 text-left">Kunde</th>
                  <th className="py-2 px-3 text-left">Adresse</th>
                  <th className="py-2 px-3 text-left">Kommission</th>
                  <th className="py-2 px-3 text-left">Hinweis</th>
                  <th className="py-2 px-3 text-left">Telefon</th>
                  <th className="py-2 px-3 text-left">Position</th>
                  <th className="py-2 px-3 text-center">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-2 px-3">{s.kunde}</td>
                    <td className="py-2 px-3">{s.adresse}</td>
                    <td className="py-2 px-3">{s.kommission}</td>
                    <td className="py-2 px-3">{s.hinweis}</td>
                    <td className="py-2 px-3">{s.telefon}</td>
                    <td className="py-2 px-3">{s.position}</td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => deleteStopp(s.id)}
                        className="text-red-600 hover:underline"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
