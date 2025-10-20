import React, { useState, useEffect } from 'react'
import logo from './logo.png'

const API_BASE = "https://tourenplan.onrender.com"

function App() {
  const [fahrerId, setFahrerId] = useState("")
  const [datum, setDatum] = useState("")
  const [tour, setTour] = useState([])
  const [fahrerListe, setFahrerListe] = useState([])
  const [fahrerName, setFahrerName] = useState("")

  // Fahrer beim Start laden
  useEffect(() => {
    const fetchFahrer = async () => {
      try {
        const res = await fetch(`${API_BASE}/fahrer`)
        const data = await res.json()
        setFahrerListe(data)
      } catch (err) {
        console.error("Fehler beim Laden der Fahrer:", err)
      }
    }
    fetchFahrer()
  }, [])

  const fetchTour = async () => {
    if (!fahrerId || !datum) return
    const res = await fetch(`${API_BASE}/touren/${fahrerId}/${datum}`)
    const data = await res.json()
    setTour(data)

    // Fahrernamen speichern für Anzeige
    const fahrer = fahrerListe.find(f => f.id == fahrerId)
    setFahrerName(fahrer ? fahrer.name : "")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 flex items-center shadow">
        <img src={logo} alt="Firmenlogo" className="h-10 bg-white p-1 rounded mr-3" />
        <h1 className="text-2xl font-bold">Tourenplan</h1>
      </header>

      {/* Eingabefelder */}
      <div className="max-w-xl mx-auto mt-6 p-4 bg-white shadow rounded-lg">
        <label className="block mb-2 font-semibold">Fahrer</label>
        <select
          value={fahrerId}
          onChange={(e) => setFahrerId(e.target.value)}
          className="border rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Bitte Fahrer wählen</option>
          {fahrerListe.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Datum</label>
        <input 
          type="date" 
          value={datum} 
          onChange={(e) => setDatum(e.target.value)} 
          className="border rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button 
          onClick={fetchTour} 
          className="bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold hover:bg-blue-700 hover:shadow-md transition"
        >
          🚚 Tour laden
        </button>
      </div>

      {/* Tour-Überschrift + Stopps */}
      {tour.length > 0 && (
        <div className="max-w-xl mx-auto mt-6">
          <h2 className="text-xl font-bold mb-4 text-center">
            Tour von {fahrerName} am {datum}
          </h2>
          <div className="space-y-4">
            {tour.map((stopp) => (
              <div key={stopp.stopp_id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{stopp.adresse}</p>
                  <p className="text-sm text-gray-500">Reihenfolge: {stopp.reihenfolge}</p>
                </div>
                <a 
                  href={`https://www.google.com/maps?q=${stopp.lat},${stopp.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 hover:shadow-md transition"
                >
                  Navigation
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
