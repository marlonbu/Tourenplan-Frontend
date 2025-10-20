import React, { useState } from "react";

function App() {
  const [fahrer, setFahrer] = useState("");
  const [datum, setDatum] = useState("");

  const handleLoadTour = () => {
    alert(`Tour geladen für Fahrer: ${fahrer} am ${datum}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🚛 Tourenplan</h1>
      </header>

      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
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
    </div>
  );
}

export default App;
