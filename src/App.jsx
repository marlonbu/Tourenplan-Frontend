import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// --- Marker-Fix: sorgt dafür, dass die blauen Leaflet-Pins korrekt geladen werden ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  const [fahrer, setFahrer] = useState([]);
  const [selectedFahrer, setSelectedFahrer] = useState("");
  const [datum, setDatum] = useState("");
  const [tour, setTour] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = "https://tourenplan.onrender.com";

  // Leaflet-Refs, damit wir Map & Routing sauber aufräumen können
  const mapRef = useRef(null);
  const routingRef = useRef(null);

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
      // Karte aufräumen, falls sie offen war
      if (routingRef.current) {
        routingRef.current.remove();
        routingRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    } catch (err) {
      console.error("Fehler beim Reset/Seed:", err);
      alert("❌ Fehler beim Demo-Neuladen");
    } finally {
      setLoading(false);
    }
  };

  // Karte & Routing aufbauen, wenn Tour vorhanden
  useEffect(() => {
    // vorherige Instanzen sauber entfernen
    if (routingRef.current) {
      routingRef.current.remove();
      routingRef.current = null;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    if (tour.length > 1) {
      // Map erstellen
      const map = L.map("map", {
        center: [tour[0].lat, tour[0].lng],
        zoom: 10,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a>',
      }).addTo(map);

      // Marker setzen
      tour.forEach((stopp) => {
        L.marker([stopp.lat, stopp.lng]).addTo(map).bindPopup(stopp.adresse);
      });

      // Routing hinzufügen
      const routing = L.Routing.control({
        waypoints: tour.map((s) => L.latLng(s.lat, s.lng)),
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: "red", weight: 4 }] },
        createMarker: (i, wp) => L.marker(wp.latLng).bindPopup(tour[i].adresse),
      })
        .on("routeselected", () => {
          // Panel (Turn-by-Turn) zuverlässig weg
          const panel = document.querySelector(".leaflet-routing-container");
          if (panel) panel.style.display = "none";
        })
        .addTo(map);

      routingRef.current = routing;

      // Falls das Panel noch später gerendert wird: nachträglich entfernen
      setTimeout(() => {
        const panel = document.querySelector(".leaflet-routing-container");
        if (panel) panel.style.display = "none";
      }, 200);
    }

    // Cleanup, wenn Komponente unmountet oder Tour wechselt
    return () => {
      if (routingRef.current) {
        routingRef.current.remove();
        routingRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [tour]);

  return (
    <div className="App">
      <h1>🚚 Tourenplan</h1>

      {/* Reset Button */}
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
          style={{
            height: "600px",
            width: "100%",
            marginTop: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
        />
      )}
    </div>
  );
}

export default App;
