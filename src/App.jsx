import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  const [fahrer, setFahrer] = useState("");
  const [datum, setDatum] = useState("");

  // Demo-Tourdaten
  const demoTour = [
    {
      id: 1,
      ankunftszeit: "08:30",
      kunde: "Muster GmbH",
      kommission: "KOM-123",
      adresse: "Bahnhofstr. 12, 49699 Lindern",
      anmerkung: "Anlieferung Seiteneingang",
      lat: 52.843,
      lng: 7.768,
    },
    {
      id: 2,
      ankunftszeit: "09:15",
      kunde: "Test AG",
      kommission: "KOM-456",
      adresse: "Bremer Str. 45, 26122 Oldenburg",
      anmerkung: "Ansprechpartner: Herr Meier",
      lat: 53.143,
      lng: 8.214,
    },
    {
      id: 3,
      ankunftszeit: "10:00",
      kunde: "Beispiel OHG",
      kommission: "KOM-789",
      adresse: "Industriestr. 8, 49661 Cloppenburg",
      anmerkung: "Bitte Lieferschein abstempeln",
      lat: 52.85,
      lng: 7.98,
    },
    {
      id: 4,
      ankunftszeit: "11:30",
      kunde: "Kunde XY",
      kommission: "KOM-101",
      adresse: "Am Markt 5, 26203 Wardenburg",
      anmerkung: "Hintereingang benutzen",
      lat: 53.061,
      lng: 8.198,
    },
  ];

  const handleLoadTour = () => {
    alert(`Tour geladen für Fahrer: ${fahrer} am ${datum}`);
  };

  // Google Maps Route öffnen
  const openGoogleMaps = () => {
    if (demoTour.length === 0) return;

    const origin = encodeURIComponent(demoTour[0].adresse);
    const destination = encodeURIComponent(demoTour[demoTour.length - 1].adresse);

    const waypoints = demoTour
      .slice(1, demoTour.length - 1)
      .map((s) => encodeURIComponent(s.adresse))
      .join("|");

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;

    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🚛 Tourenplan</h1>
      </header>

      {/* Eingabe-Bereich */}
      <div className="bg-white shadow-md rounded-lg p-6 max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Fahrer-Auswahl */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fahrer
            </label>
            <select
              value={fahrer}
              onChange={(e) => setFahrer(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">-- bitte wählen --</option>
              <option value="1">Christoph Arlt</option>
              <option value="2">Hans Noll</option>
              <option value="3">Johannes Backhaus</option>
              <option value="4">Markus Honkomp</option>
            </select>
          </div>

          {/* Datum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum
            </label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Button */}
          <div className="flex items-end">
            <button
              onClick={handleLoadTour}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md w-full"
            >
              Tour laden
            </button>
          </div>
        </div>
      </div>

      {/* Split-Screen Bereich */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Karte */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <MapContainer
            center={[52.9, 8.0]}
            zoom={9}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {demoTour.map((stopp) => (
              <Marker key={stopp.id} position={[stopp.lat, stopp.lng]}>
                <Popup>
                  <b>{stopp.kunde}</b>
                  <br />
                  {stopp.adresse}
                  <br />
                  ⏰ {stopp.ankunftszeit}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Tabelle */}
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Tourdaten</h2>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-200 px-3 py-2 text-left">
                    Ankunftszeit
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left">
                    Kunde
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left">
                    Kommission
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left">
                    Adresse
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left">
                    Anmerkung
                  </th>
                </tr>
              </thead>
              <tbody>
                {demoTour.map((stopp) => (
                  <tr key={stopp.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2">
                      {stopp.ankunftszeit}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      {stopp.kunde}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      {stopp.kommission}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      {stopp.adresse}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      {stopp.anmerkung}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Google Maps Button */}
          <div className="mt-4 text-center">
            <button
              onClick={openGoogleMaps}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md"
            >
              📍 Route in Google Maps öffnen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
