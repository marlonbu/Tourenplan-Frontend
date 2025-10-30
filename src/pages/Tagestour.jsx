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

// ---------- Icons ----------
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const startDivIcon = L.divIcon({
  className: "start-marker",
  html: `<div style="
    font-size:24px;
    line-height:24px;
    transform: translate(-12px, -12px);
  ">🏭</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// ---------- Hilfskomponenten ----------
function FitToBounds({ lineCoords }) {
  const map = useMap();
  useEffect(() => {
    if (lineCoords && lineCoords.length > 0) {
      const bounds = L.latLngBounds(lineCoords.map(([lat, lon]) => L.latLng(lat, lon)));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [lineCoords, map]);
  return null;
}

// ---------- Utils ----------
const START_ADRESSE = "Hans Gehlenborg GmbH, Fehnstraße 3, 49699 Lindern";

async function geocodeAdresse(addr) {
  if (!addr) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    addr
  )}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json && json[0]) {
    return [parseFloat(json[0].lat), parseFloat(json[0].lon)]; // [lat, lon]
  }
  return null;
}

function telHref(raw) {
  if (!raw) return "";
  // Entfernt Leerzeichen, Klammern, Bindestriche, Slashes
  const cleaned = raw.replace(/[()\s\-\/]/g, "");
  return `tel:${cleaned}`;
}

// Baut eine Google-Maps-URL mit allen Stopps (origin = Start, destination = letzter Stopp, waypoints = Rest)
function buildGoogleMapsRouteURL(startAdresse, stopps) {
  const addrs = (stopps || [])
    .map((s) => s?.adresse)
    .filter(Boolean);

  if (addrs.length === 0) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(startAdresse)}`;
  }

  const origin = encodeURIComponent(startAdresse);
  const destination = encodeURIComponent(addrs[addrs.length - 1]);
  const waypoints =
    addrs.length > 1
      ? `&waypoints=${encodeURIComponent(addrs.slice(0, -1).join("|"))}`
      : "";

  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${origin}&destination=${destination}${waypoints}`;
}

// Fragt eine Straßenroute bei OSRM ab (driving), erwartet coords: [[lat, lon], ...]
async function fetchOsrmRoute(coords) {
  if (!coords || coords.length < 2) return null;
  // OSRM erwartet lon,lat;lon,lat;...
  const path = coords
    .map(([lat, lon]) => `${lon},${lat}`)
    .join(";");

  const url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const line =
    data?.routes?.[0]?.geometry?.coordinates?.map(([lon, lat]) => [lat, lon]) || [];
  return line.length ? line : null;
}

export default function Tagestour() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [coords, setCoords] = useState([]); // nur Marker-Koordinaten (Start + Stopps)
  const [routeCoords, setRouteCoords] = useState([]); // OSRM-Routenlinie
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Autosave-Status für "Anmerkung Fahrer"
  const [saveState, setSaveState] = useState({}); // { [id]: "saving"|"saved"|"error"|"idle" }
  const timersRef = useRef({}); // Debounce Timer je Stopp-ID

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
    setRouteCoords([]);
    setSaveState({});

    try {
      const data = await api.getTour(selectedFahrer, datum);
      setTour(data.tour);
      const s = data.stopps || [];
      setStopps(s);
      setMsg(data.tour ? "✅ Tour geladen" : "ℹ️ Keine Tour gefunden");

      // --- Geokodierung: Start + Stopps (in Reihenfolge Start -> Stopp1 -> Stopp2 ...)
      const startCoord = await geocodeAdresse(START_ADRESSE);
      const stoppCoords = [];

      for (const st of s) {
        if (!st?.adresse) {
          stoppCoords.push(null);
          continue;
        }
        try {
          const c = await geocodeAdresse(st.adresse);
          stoppCoords.push(c);
        } catch {
          stoppCoords.push(null);
        }
      }

      const markerCoords = [startCoord, ...stoppCoords].filter(Boolean);
      setCoords(markerCoords);

      // --- OSRM Route holen (wenn mind. Start + 1 Ziel)
      const routeInput = [startCoord, ...stoppCoords].filter(Boolean);
      if (routeInput.length >= 2) {
        const route = await fetchOsrmRoute(routeInput);
        if (route && route.length) {
          setRouteCoords(route);
        } else {
          // Fallback: einfache Linie (falls OSRM down)
          setRouteCoords(routeInput);
        }
      } else {
        setRouteCoords([]);
      }
    } catch (err) {
      console.error("Fehler:", err);
      setMsg("❌ Tour konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  // Eingabe-Handler für "Anmerkung Fahrer" (Autosave)
  function handleAnmerkungChange(id, value) {
    setStopps((prev) => prev.map((s) => (s.id === id ? { ...s, anmerkung_fahrer: value } : s)));

    if (timersRef.current[id]) clearTimeout(timersRef.current[id]);
    setSaveState((st) => ({ ...st, [id]: "saving" }));

    timersRef.current[id] = setTimeout(() => saveAnmerkung(id, value), 1000);
  }

  function handleAnmerkungBlur(id, value) {
    if (timersRef.current[id]) clearTimeout(timersRef.current[id]);
    saveAnmerkung(id, value);
  }

  async function saveAnmerkung(id, value) {
    try {
      await api.updateStoppAnmerkung(id, value);
      setSaveState((st) => ({ ...st, [id]: "saved" }));
      setTimeout(() => setSaveState((st) => ({ ...st, [id]: "idle" })), 1500);
    } catch (err) {
      console.error("Anmerkung speichern fehlgeschlagen:", err);
      setSaveState((st) => ({ ...st, [id]: "error" }));
    }
  }

  // Google-Maps Button URL
  const gmapsUrl = buildGoogleMapsRouteURL(START_ADRESSE, stopps);

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
            <h2 className="text-lg font-medium text-[#0058A3]">Stopps dieser Tour</h2>

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
                    <td colSpan="7" className="text-center py-2 text-gray-500 italic">
                      Keine Stopps vorhanden
                    </td>
                  </tr>
                )}
                {stopps.map((s, i) => (
                  <tr key={s.id || i} className="hover:bg-gray-50 align-top">
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
                    <td className="border px-2 py-1">
                      {s.telefon ? (
                        <a href={telHref(s.telefon)} className="text-blue-600 hover:underline">
                          {s.telefon}
                        </a>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="border px-2 py-1">{s.kommission}</td>
                    <td className="border px-2 py-1">{s.hinweis}</td>
                    <td className="border px-2 py-1 w-[260px]">
                      <textarea
                        className="border rounded-md px-2 py-1 w-full resize-y min-h-[34px]"
                        placeholder='z. B. "ok" oder Problem notieren'
                        value={s.anmerkung_fahrer || ""}
                        onChange={(e) => handleAnmerkungChange(s.id, e.target.value)}
                        onBlur={(e) => handleAnmerkungBlur(s.id, e.target.value)}
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

          {/* Google Maps Button */}
          <div className="w-full flex items-center justify-center">
            <a
              href={gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#0058A3] text-white px-5 py-2 rounded-md shadow hover:bg-blue-800"
            >
              Tour in Google Maps öffnen
            </a>
          </div>

          {/* Karte */}
          <section className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-medium text-[#0058A3]">Karte</h2>

            {loading ? (
              <div className="text-gray-500 italic text-center py-10">
                Karte wird geladen …
              </div>
            ) : (
              <div style={{ height: "520px", width: "100%" }}>
                <MapContainer
                  center={[52.9, 8.0]}
                  zoom={9}
                  style={{ height: "100%", width: "100%", borderRadius: "10px" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Startpunkt */}
                  {coords[0] && (
                    <Marker position={coords[0]} icon={startDivIcon}>
                      <Popup>
                        <b>Start</b>
                        <br />
                        {START_ADRESSE}
                      </Popup>
                    </Marker>
                  )}

                  {/* Stopps (Marker ab Index 1) */}
                  {coords.slice(1).map((pos, i) => (
                    <Marker key={i} position={pos} icon={defaultIcon}>
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

                  {/* Route (OSRM) */}
                  {routeCoords.length > 0 && (
                    <>
                      <Polyline positions={routeCoords} />
                      <FitToBounds lineCoords={routeCoords} />
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
