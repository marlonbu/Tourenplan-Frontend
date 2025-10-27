import React, { useState, useEffect } from "react";
import { api } from "../api";
import MapView from "../components/MapView";

export default function Tagestour() {
  const [me, setMe] = useState(null);
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(new Date().toISOString().split("T")[0]);
  const [stopps, setStopps] = useState([]);
  const [tourInfo, setTourInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Hole User-Info (role, fahrer_id)
  useEffect(() => {
    api.me().then(setMe).catch(() => setError("Fehler beim Laden des Benutzers"));
  }, []);

  // Lade Fahrerliste: Admin → alle, Fahrer → nur sich selbst (kommt schon gefiltert vom Backend)
  useEffect(() => {
    if (!me) return;
    api
      .listFahrer()
      .then((list) => {
        setFahrer(list);
        // Fahrer: setze automatisch seine ID; Admin: nimm ersten Eintrag
        if (me.role === "fahrer" && me.fahrer_id) {
          setSelectedFahrer(String(me.fahrer_id));
        } else if (list.length) {
          setSelectedFahrer(String(list[0].id));
        }
      })
      .catch(() => setError("Fehler beim Laden der Fahrer"));
  }, [me]);

  async function ladeTour() {
    if (!selectedFahrer || !datum) return;
    setLoading(true);
    try {
      const data = await api.getTourForDay(selectedFahrer, datum);
      setTourInfo(data.tour);
      setStopps(data.stopps);
      setError("");
    } catch (err) {
      setError("Fehler beim Laden der Tour");
    } finally {
      setLoading(false);
    }
  }

  async function handleFotoUpload(stoppId, file) {
    try {
      await api.uploadFoto(stoppId, file);
      ladeTour();
    } catch {
      alert("Foto-Upload fehlgeschlagen");
    }
  }

  useEffect(() => {
    if (selectedFahrer) ladeTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFahrer, datum]);

  if (!me) {
    return <div className="text-gray-500">Lade Benutzer…</div>;
  }

  const isAdmin = me.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 bg-white shadow rounded-lg p-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Fahrer</label>
          {isAdmin ? (
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
          ) : (
            <input
              className="border rounded-md px-3 py-2 bg-gray-100"
              value={fahrer[0]?.name || "Mein Fahrerprofil"}
              disabled
              readOnly
            />
          )}
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
          className="btn-primary mt-2 sm:mt-0"
          disabled={!selectedFahrer}
        >
          Tour laden
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Lade Tour…</p>}

      {tourInfo && (
        <>
          <div className="bg-white shadow rounded-lg p-4 table-container">
            <table>
              <thead>
                <tr>
                  <th>Kunde</th>
                  <th>Adresse</th>
                  <th>Kommission</th>
                  <th>Hinweis</th>
                  <th>Telefon</th>
                  <th>Foto</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s) => (
                  <tr key={s.id}>
                    <td>{s.kunde}</td>
                    <td>{s.adresse}</td>
                    <td>{s.kommission}</td>
                    <td>{s.hinweis}</td>
                    <td>{s.telefon}</td>
                    <td>
                      {s.foto_url ? (
                        <a
                          href={s.foto_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0058A3] hover:underline"
                        >
                          📷 anzeigen
                        </a>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFotoUpload(s.id, e.target.files[0])
                          }
                        />
                      )}
                    </td>
                  </tr>
                ))}
                {!stopps.length && (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-400 italic py-3">
                      Keine Stopps vorhanden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <MapView stopps={stopps} />
          </div>
        </>
      )}
    </div>
  );
}
