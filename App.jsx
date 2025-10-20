import React, { useState, useEffect } from 'react'

const API_BASE = "https://tourenplan.onrender.com"

function App() {
  const [fahrerId, setFahrerId] = useState("")
  const [datum, setDatum] = useState("")
  const [tour, setTour] = useState([])

  const fetchTour = async () => {
    if (!fahrerId || !datum) return
    const res = await fetch(`${API_BASE}/touren/${fahrerId}/${datum}`)
    const data = await res.json()
    setTour(data)
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">🚚 Tourenplan</h1>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <label className="block mb-2 font-semibold">Fahrer ID</label>
        <input 
          type="text" 
          value={fahrerId} 
          onChange={(e) => setFahrerId(e.target.value)} 
          className="border rounded p-2 w-full mb-4"
        />

        <label className="block mb-2 font-semibold">Datum</label>
        <input 
          type="date" 
          value={datum} 
          onChange={(e) => setDatum(e.target.value)} 
          className="border rounded p-2 w-full mb-4"
        />

        <button 
          onClick={fetchTour} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Tour laden
        </button>
      </div>

      {tour.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Stopps</h2>
          <ul className="space-y-3">
            {tour.map((stopp) => (
              <li key={stopp.stopp_id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{stopp.adresse}</p>
                  <p className="text-sm text-gray-500">Reihenfolge: {stopp.reihenfolge}</p>
                </div>
                <a 
                  href={`https://www.google.com/maps?q=${stopp.lat},${stopp.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold hover:underline"
                >
                  Navigation
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default App
