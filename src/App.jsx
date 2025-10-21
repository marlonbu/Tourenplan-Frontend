import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

function App() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState("");
  const [tour, setTour] = useState([]);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const markersRef = useRef([]);

  const apiUrl = "https://tourenplan.onrender.com";

  // Fahrer laden
  useEffect(() => {
    fetch(`${apiUrl}/fahrer`)
      .then((res) => res.json())
      .then(setFahrer)
      .catch((err) => console.error(err));
  }, []);

  // Tour laden
  const ladeTour = () => {
    if (!selectedFahrer || !datum) return;
    setLoading(true);
    fetch(`${apiUrl}/touren/${selectedFahrer}/${datum}`)
      .then((res) => res.json())
      .then((data) => {
        setTour(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // Demo neu laden
  const resetUndSeed = async () => {
    try {
      setLoading(true);
      await fetch(`${apiUrl}/reset`);
      await fetch(`${apiUrl}/seed-demo`);
      alert("✅ Demo-Daten wurden neu erstellt!");
      setTour([]);
      setSelectedFahrer("");
      setDatum("");
    } catch (err) {
      console.error("Fehler beim Reset/Seed:", err);
      alert("❌ Fehler beim Demo-Neuladen");
    } finally {
      setLoading(false);
    }
  };

  // Karte nur EINMAL initialisieren
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [52.85, 8.05],
        zoom: 8,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a>',
      }).addTo(mapRef.current);
    }
  }, []);

  // Routing + Marker aktualisieren
  useEffect(() => {
    if (!mapRef.current) return;

    // alte Marker löschen
    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];

    // alte Route löschen
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    if (tour.length > 0) {
      // Marker hinzufügen
      tour.forEach((stopp) => {
        const marker = L.marker([stopp.lat, stopp.lng]).bindPopup(stopp.adresse);
        marker.addTo(mapRef.current);
        markersRef.current.push(marker);
      });
    }

    if (tour.length > 1) {
      // Routing OHNE Panel
      routingControlRef.current = L.Routing.control({
        waypoints: tour.map((s) => L.latLng(s.lat, s.lng)),
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false, // 🚀 Panel wird deaktiviert
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: "red", weight: 4 }],
        },
      }).addTo(mapRef.current);
    }
  }, [tour]);

  return (
    <div className="App">
      <h1>🚚 Tourenplan</h1>

      {/* Buttons */}
      <div className="controls">
        <button onClick={resetUndSeed} disabled={loading}>
          🔄 Demo neu laden
        </button>
      </div>

      {/* Fahrer Auswahl */}
      <div className="controls">
        <select
          value={selectedFahrer}
          onChange={(e) => setSelectedFahrer(e.target.value)}
        >
          <option value="">Fahrer auswählen</option>
          {fahrer.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
        />
        <button onClick={ladeTour} disabled={loading}>
          Laden
        </button>
      </div>

      {/* Tabelle */}
      {tour.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Ankunftszeit</th>
              <th>Kunde</th>
              <th>Kommission</th>
              <th>Adresse</th>
              <th>Anmerkung</th>
            </tr>
          </thead>
          <tbody>
            {tour.map((stopp, i) => (
              <tr key={i}>
                <td>{stopp.ankunftszeit || "08:00"}</td>
                <td>{stopp.kunde || `Kunde ${i + 1}`}</td>
                <td>{stopp.kommission || `KOM-${1000 + i}`}</td>
                <td>{stopp.adresse}</td>
                <td>{stopp.anmerkung || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Karte */}
      {tour.length > 0 && (
        <div
          id="map"
          style={{ height: "500px", width: "100%", marginTop: "20px" }}
        ></div>
      )}
    </div>
  );
}

export default App;
