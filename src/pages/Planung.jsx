import React, { useState, useEffect } from "react";
import { api } from "../api";

export default function Planung({ fahrer, selectedFahrerId }) {
  const [datum, setDatum] = useState("");
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

  useEffect(() => {
    if (selectedFahrerId && datum) loadTour();
  }, [selectedFahrerId, datum]);

  async function loadTour() {
    setLoading(true);
    try {
      const data = await api.getTourForDay(selectedFahrerId, datum);
      setStopps(data.stopps || []);
    } catch (err) {
      console.error(err);
      setStopps([]);
    } finally {
      setLoading(false);
    }
  }

  async function addStopp() {
    if (!neuerStopp.kunde || !neuerStopp.adresse) return alert("Kunde & Adresse erforderlich");
    const body = { ...neuerStopp, fahrer_id: selectedFahrerId, datum };
    await api.addStopp(body);
    setNeuerStopp({ kunde: "", adresse: "", kommission: "", hinweis: "", telefon: "", position: "" });
    await loadTour();
  }

  async function deleteStopp(id) {
    if (!window.confirm("Diesen Stopp wirklich löschen?")) return;
    await api.deleteStopp(id);
    await loadTour();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Datum</label>
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <button
          onClick={loadTour}
          className="btn-secondary mt-5"
          disabled={!datum || !selectedFahrerId}
        >
          Laden
        </button>
      </div>

      {/* Tabelle der Stopps */}
      {loading ? (
        <div className="text-gray-500">Lade Tourdaten…</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Kunde</th>
                <th>Adresse</th>
                <th>Kommission</th>
                <th>Hinweis</th>
                <th>Tel.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stopps.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.kunde}</td>
                  <td>{s.adresse}</td>
                  <td>{s.kommission}</td>
                  <td>{s.hinweis}</td>
                  <td>{s.telefon}</td>
                  <td>
                    <button
                      onClick={() => deleteStopp(s.id)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {!stopps.length && (
                <tr>
                  <td colSpan="7" className="text-center text-gray-400 italic py-3">
                    Keine Stopps vorhanden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Neuer Stopp */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <h2 className="font-semibold text-primary text-lg">Neuen Stopp hinzufügen</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            placeholder="Kunde"
            value={neuerStopp.kunde}
            onChange={(e) => setNeuerStopp({ ...neuerStopp, kunde: e.target.value })}
          />
          <input
            placeholder="Adresse"
            value={neuerStopp.adresse}
            onChange={(e) => setNeuerStopp({ ...neuerStopp, adresse: e.target.value })}
          />
          <input
            placeholder="Kommission"
            value={neuerStopp.kommission}
            onChange={(e) => setNeuerStopp({ ...neuerStopp, kommission: e.target.value })}
          />
          <input
            placeholder="Hinweis"
            value={neuerStopp.hinweis}
            onChange={(e) => setNeuerStopp({ ...neuerStopp, hinweis: e.target.value })}
          />
          <input
            placeholder="Telefon"
            value={neuerStopp.telefon}
            onChange={(e) => setNeuerStopp({ ...neuerStopp, telefon: e.target.value })}
          />
          <input
            placeholder="Position"
            value={neuerStopp.position}
            onChange={(e) => setNeuerStopp({ ...neuerStopp, position: e.target.value })}
          />
        </div>
        <div>
          <button
            onClick={addStopp}
            className="btn-primary mt-3"
            disabled={!datum || !selectedFahrerId}
          >
            ➕ Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}
