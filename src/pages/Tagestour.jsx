import React, { useEffect, useRef, useState } from "react";
import { api } from "../api";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// Leaflet-Icon (Standard)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Hilfskomponente zum automatischen Zoomen auf Marker
function FitToMarkers({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coords, map]);
  return null;
}

export default function Tagestour() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [coords, setCoords] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Status je Stopp-ID für Auto-Save: "idle" | "saving" | "saved" | "error"
  const [saveState, setSaveState] = useState({}); // { [id]: "saving" | ... }
  const timersRef = useRef({}); // { [id]: timeoutId }

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

    setLoading(true);
    setCoords([]);
    setSaveState({});
    try {
      const data = await api.getTour(selectedFahrer, datum);
      setTour(data.tour);
      const s = data.stopps || [];
      setStopps(s);
      setMsg(data.tour ? "✅ Tour geladen" : "ℹ️ Keine Tour gefunden");

      // Geokodierung
      if (s.length > 0) {
        const coordsNeu = [];
        for (const st of s) {
          if (!st.adresse) continue;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                st.adresse
              )}`
            );
            const json = await res.json();
            if (json[0]) {
              coordsNeu.push([parseFloat(json[0].lat), parseFloat(json[0].lon)]);
            }
          } catch {
            // ignorieren
          }
        }
        setCoords(coordsNeu);
      }
    } catch (err) {
      console.error("Fehler:", err);
      setMsg("❌ Tour konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  // Eingabe-Handler für "Anmerkung Fahrer"
  function handleAnmerkungChange(id, value) {
    // UI sofort updaten
    setStopps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, anmerkung_fahrer: value } : s))
    );

    // evtl. laufenden Timer abbrechen
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
    }

    // "saving" anzeigen
    setSaveState((st) => ({ ...st, [id]: "saving" }));

    // Debounce: nach 1s ohne Tipp speichern
    timersRef.current[id] = setTimeout(() => {
      saveAnmerkung(id, value);
    }, 1000);
  }

  // Sofort speichern bei Blur (Feld verlassen)
  function handleAnmerkungBlur(id, value) {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
    }
    saveAnmerkung(id, value);
  }

  async function saveAnmerkung(id, value) {
    try {
      await api.updateStoppAnmerkung(id, value);
      setSaveState((st) => ({ ...st, [id]: "saved" }));
      // „saved“ Meldung nach kurzer Zeit wieder ausblenden
      setTimeout(() => {
        setSaveState((st) => ({ ...st, [id]: "idle" }));
      }, 1500);
    } catch (err) {
      console.error("Anmerkung speichern fehlgeschlagen:", err);
      setSaveState((st) => ({ ...st, [id]: "error" }));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#0058A3]">Tagestour</h1>

      {/* Auswahl */}
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

      {/* Stopps */}
      {tour && (
        <>
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
                  <th className="border px-2 py-1">Anmerkung Fahrer</th>
                </tr>
              </thead>
              <tbody>
                {stopps.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-2 text-gray-500 italic"
                    >
                      Keine Stopps vorhanden
                    </td>
                  </tr>
                )}
                {stopps.map((s, i) => (
                  <tr key={s.id || i} className="hover:bg-gray-50 align-top">
                    <td className="border px-2 py-1 text-center">
                      {s.position}
                    </td>
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
                    <td className="border px-2 py-1 w-[260px]">
                      <textarea
                        className="border rounded-md px-2 py-1 w-full resize-y min-h-[34px]"
                        placeholder='z. B. "ok" oder Problem notieren'
                        value={s.anmerkung_fahrer || ""}
                        onChange={(e) =>
                          handleAnmerkungChange(s.id, e.target.value)
                        }
                        onBlur={(e) =>
                          handleAnmerkungBlur(s.id, e.target.value)
                        }
                      />
                      <div className="text-xs mt-1 h-4">
                        {saveState[s.id] === "saving" && (
                          <span className="text-gray-500">💾 Speichern…</span>
                        )}
                        {saveState[s.id] === "saved" && (
                          <span className="text-green-600">✅ Gespeichert</span>
                        )}
                        {saveState[s.id] === "error" && (
                          <span className="text-red-600">❌ Fehler</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Karte */}
          <section className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium text-[#0058A3]">Karte</h2>

            {loading ? (
              <div className="text-gray-500 italic text-center py-10">
                Karte wird geladen …
              </div>
            ) : (
              <div style={{ height: "500px", width: "100%" }}>
                <MapContainer
                  center={[52.9, 8.0]}
                  zoom={8}
                  style={{ height: "100%", width: "100%", borderRadius: "10px" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {coords.map((pos, i) => (
                    <Marker key={i} position={pos} icon={icon}>
                      <Popup>
                        <div className="text-sm">
                          <b>{stopps[i]?.kunde}</b>
                          <br />
                          {stopps[i]?.adresse}
                          <br />
                          Pos: {stopps[i]?.position || i + 1}
                          {stopps[i]?.anmerkung_fahrer ? (
                            <>
                              <br />
                              <i>Anmerkung: {stopps[i].anmerkung_fahrer}</i>
                            </>
                          ) : null}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {coords.length > 1 && (
                    <>
                      <Polyline positions={coords} color="#0058A3" />
                      <FitToMarkers coords={coords} />
                    </>
                  )}
                </MapContainer>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
