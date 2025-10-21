import React, { useState, useEffect } from "react";
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
  const [meldung, setMeldung] = useState("");

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
    setMeldung("");
    fetch(`${apiUrl}/touren/${selectedFahrer}/${datum}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          setMeldung("⚠️ Für diesen Fahrer gibt es an diesem Datum keine Tour.");
        }
        setTour(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // 🚀 Demo neu laden (reset + seed)
  const resetUndSeed = async () => {
    try {
      setLoading(true);
      await fetch(`${apiUrl}/reset`);
      await fetch(`${apiUrl}/seed-demo`);
      alert("✅ Demo-Daten wurden neu erstellt!");
      setTour([]);
      setSelectedFahrer("");
      setDatum("");
      setMeldung("");
    } catch (err) {
      console.error("Fehler beim Reset/Seed:", err);
      alert("❌ Fehler beim Demo-Neuladen");
    } finally {
      setLoading(false);
    }
  };

  // Routing + Karte
  useEffect(() => {
    if (tour.length > 1) {
      const map = L.map("map", {
        center: [tour[0].lat, tour[0].lng],
        zoom: 10,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a>',
      }).addTo(map);

      // Marker setzen
      tour.forEach((stopp) => {
        L.marker([stopp.lat, stopp.lng], {
          icon: L.icon({
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        })
          .addTo(map)
          .bindPopup(stopp.adresse);
      });

      // Routing ohne Turn-by-Turn Panel
      L.Routing.control({
        waypoints: tour.map((s) => L.latLng(s.lat, s.lng)),
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: "red", weight: 4 }] },
        createMarker: (i, wp) => {
          return L.marker(wp.latLng).bindPopup(tour[i].adresse);
        },
      })
        .on("routeselected", function () {
          const container = document.querySelector(".leaflet-routing-container");
          if (container) container.style.display = "none";
        })
        .addTo(map);
    }
  }, [tour]);

  // Google Maps Link generieren
  const googleMapsLink = () => {
    if (tour.length === 0) return "#";
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      tour[0].adresse
    )}`;
    url += `&destination=${encodeURIComponent(
      tour[tour.length - 1].adresse
    )}`;
    if (tour.length > 2) {
      const waypoints = tour
        .slice(1, -1)
        .map((s) => encodeURIComponent(s.adresse))
        .join("|");
      url += `&waypoints=${waypoints}`;
    }
    url += "&travelmode=driving";
    return url;
  };

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

      {/* Meldung wenn keine Tour */}
      {meldung && (
        <div style={{ marginTop: "20px", color: "red", fontWeight: "bold" }}>
          {meldung}
        </div>
      )}

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
              <th>Status</th>
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
                <td>
                  {stopp.erledigt ? (
                    "✅"
                  ) : (
                    <input
                      type="checkbox"
                      onChange={async () => {
                        try {
                          await fetch(`${apiUrl}/scan`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ stopp_id: stopp.stopp_id }),
                          });
                          const updatedTour = [...tour];
                          updatedTour[i].erledigt = true;
                          setTour(updatedTour);
                        } catch (err) {
                          console.error("Fehler beim Erledigen:", err);
                        }
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Karte */}
      {tour.length > 0 && (
        <>
          <div
            id="map"
            style={{
              height: "500px",
              width: "100%",
              marginTop: "20px",
              borderRadius: "12px",
            }}
          ></div>

          {/* Google Maps Button */}
          <div style={{ marginTop: "20px" }}>
            <a href={googleMapsLink()} target="_blank" rel="noopener noreferrer">
              <button style={{ padding: "10px 20px", fontSize: "16px" }}>
                ➡️ Route in Google Maps öffnen
              </button>
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
