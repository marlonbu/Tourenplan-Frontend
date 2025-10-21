import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "https://tourenplan.onrender.com";

function App() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0] // heutiges Datum
  );
  const [tourData, setTourData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fahrer laden
  useEffect(() => {
    fetch(`${API_BASE}/fahrer`)
      .then((res) => res.json())
      .then((data) => setFahrer(data))
      .catch((err) => console.error("Fehler beim Laden der Fahrer:", err));
  }, []);

  // Tour laden
  const loadTour = async () => {
    if (!selectedFahrer || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/touren/${selectedFahrer}/${selectedDate}`);
      const data = await res.json();
      setTourData(data);
    } catch (err) {
      console.error("Fehler beim Laden der Tour:", err);
    }
    setLoading(false);
  };

  // Google Maps Link erstellen
  const getGoogleMapsLink = () => {
    if (!tourData || tourData.length === 0) return "#";
    const coords = tourData.map((s) => `${s.lat},${s.lng}`).join("/");
    return `https://www.google.com/maps/dir/${coords}`;
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">🚚 Tourenplan</h1>

      {/* Auswahl */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={selectedFahrer}
          onChange={(e) => setSelectedFahrer(e.target.value)}
          className="border p-2 rounded"
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
          className="border p-2 rounded"
        />

        <button
          onClick={loadTour}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tour laden
        </button>
      </div>

      {/* Tourdaten */}
      {loading && <p>⏳ Lade Tourdaten...</p>}

      {!loading && tourData.length === 0 && (
        <p className="text-gray-500">❌ Keine Tour gefunden für diesen Fahrer/Tag</p>
      )}

      {tourData.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Tourübersicht</h2>
          <table className="w-full border mb-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Reihenfolge</th>
                <th className="border px-2 py-1">Adresse</th>
                <th className="border px-2 py-1">Erledigt</th>
              </tr>
            </thead>
            <tbody>
              {tourData.map((stopp) => (
                <tr key={stopp.stopp_id}>
                  <td className="border px-2 py-1">{stopp.reihenfolge}</td>
                  <td className="border px-2 py-1">{stopp.adresse}</td>
                  <td className="border px-2 py-1">
                    {stopp.erledigt ? "✅" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Karte */}
          <MapContainer
            center={[tourData[0].lat || 51.1657, tourData[0].lng || 10.4515]} // Fallback: Deutschland
            zoom={10}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap-Mitwirkende"
            />
            {tourData
              .filter((s) => s.lat && s.lng)
              .map((stopp, idx) => (
                <Marker key={idx} position={[stopp.lat, stopp.lng]}>
                  <Popup>
                    <b>Adresse:</b> {stopp.adresse}
                    <br />
                    <b>Reihenfolge:</b> {stopp.reihenfolge}
                  </Popup>
                </Marker>
              ))}

            {/* Route */}
            <Polyline
              positions={tourData
                .filter((s) => s.lat && s.lng)
                .map((s) => [s.lat, s.lng])}
              color="blue"
            />
          </MapContainer>

          <div className="mt-4">
            <a
              href={getGoogleMapsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ➡️ Route in Google Maps öffnen
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
