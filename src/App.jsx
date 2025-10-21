// App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "https://tourenplan.onrender.com";

// Helper: fix time like "010:00" -> "10:00", keep "08:00" as "08:00"
function fixTime(t) {
  if (!t) return "";
  const [hRaw, m = "00"] = String(t).split(":");
  // Normalize weird 3+ digit hour strings (e.g. "010" -> "10")
  const h = hRaw.length > 2 ? hRaw.slice(-2) : hRaw.padStart(2, "0");
  // If result is "00"–"09" keep leading zero; if "10"–"23" it’s fine
  return `${h}:${m}`;
}

// Helper: build Google Maps directions URL from lat/lng sequence
function buildGmapsLink(stops) {
  const coords = stops
    .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
    .map((s) => `${s.lat},${s.lng}`)
    .join("/");
  return coords ? `https://www.google.com/maps/dir/${coords}` : "#";
}

export default function App() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [stops, setStops] = useState([]); // your /touren response rows
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Fetch drivers once
  useEffect(() => {
    fetch(`${API_BASE}/fahrer`)
      .then((r) => r.json())
      .then((data) => setFahrer(data))
      .catch((e) => console.error("Fahrer laden fehlgeschlagen:", e));
  }, []);

  // Fetch tour for chosen driver/date
  const loadTour = async () => {
    setErr("");
    setStops([]);
    if (!selectedFahrer || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/touren/${selectedFahrer}/${selectedDate}`);
      if (!res.ok) {
        setErr(`Serverfehler (${res.status})`);
        setLoading(false);
        return;
      }
      const data = await res.json();

      // Enrich with client-side demo fields so the table shows useful info
      const customers = ["Müller GmbH", "Schmidt AG", "Bäckerei Weber", "Kaufland"];
      const enriched = data.map((s, idx) => ({
        ...s,
        // demo times: 08:00, 09:00, 10:00, 11:00 ...
        ankunft: fixTime(`${String(8 + idx).padStart(2, "0")}:00`),
        kunde: customers[idx % customers.length],
        kommission: `KOMM-${100 + idx}`,
        bemerkung: idx % 2 === 0 ? "Bitte hinten anliefern" : "Direkt beim Kunden",
        // ensure numeric lat/lng (some DB drivers return as string)
        lat: s.lat != null ? Number(s.lat) : undefined,
        lng: s.lng != null ? Number(s.lng) : undefined,
      }));

      setStops(enriched);
    } catch (e) {
      console.error(e);
      setErr("Fehler beim Laden der Tour");
    } finally {
      setLoading(false);
    }
  };

  // Map center fallback (Germany) or first valid stop
  const mapCenter = useMemo(() => {
    const firstValid = stops.find((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
    return firstValid ? [firstValid.lat, firstValid.lng] : [51.1657, 10.4515];
  }, [stops]);

  const polyline = useMemo(
    () =>
      stops
        .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
        .map((s) => [s.lat, s.lng]),
    [stops]
  );

  return (
    <div className="p-6 font-sans max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">🚚 Tourenplan</h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={selectedFahrer}
          onChange={(e) => setSelectedFahrer(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        >
          <option value="">-- Fahrer wählen --</option>
          {fahrer.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />

        <button
          onClick={loadTour}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
        >
          Tour laden
        </button>
      </div>

      {/* Status messages */}
      {loading && <p>⏳ Lade Tourdaten…</p>}
      {!loading && err && <p className="text-red-600">❌ {err}</p>}
      {!loading && !err && stops.length === 0 && (
        <p className="text-gray-600">Keine Tour für diese Auswahl gefunden.</p>
      )}

      {/* Table */}
      {stops.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-3">Tourübersicht</h2>

          <table className="w-full border-collapse border border-gray-400 mb-6 text-sm">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border border-gray-400 px-4 py-2">Reihenfolge</th>
                <th className="border border-gray-400 px-4 py-2">Ankunftszeit</th>
                <th className="border border-gray-400 px-4 py-2">Kunde</th>
                <th className="border border-gray-400 px-4 py-2">Kommission</th>
                <th className="border border-gray-400 px-4 py-2">Adresse</th>
                <th className="border border-gray-400 px-4 py-2">Anmerkung</th>
                <th className="border border-gray-400 px-4 py-2">Erledigt</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((s, idx) => (
                <tr key={s.stopp_id ?? idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2">{s.reihenfolge}</td>
                  <td className="border border-gray-300 px-4 py-2">{fixTime(s.ankunft)}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.kunde}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.kommission}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.adresse}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.bemerkung}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {s.erledigt ? "✅" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Map */}
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: "420px", width: "100%", borderRadius: "12px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap-Mitwirkende"
            />

            {stops
              .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
              .map((s, idx) => (
                <Marker key={idx} position={[s.lat, s.lng]}>
                  <Popup>
                    <b>{s.kunde}</b>
                    <br />
                    {s.adresse}
                    <br />
                    Ankunft: {fixTime(s.ankunft)}
                  </Popup>
                </Marker>
              ))}

            {polyline.length >= 2 && <Polyline positions={polyline} color="blue" />}
          </MapContainer>

          <div className="mt-4">
            <a
              href={buildGmapsLink(stops)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ➡️ Route in Google Maps öffnen
            </a>
          </div>
        </>
      )}
    </div>
  );
}
