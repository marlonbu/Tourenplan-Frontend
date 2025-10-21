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
        if (data.length === 0) setMeldung("⚠️ Für diesen Fahrer gibt es an diesem Datum keine Tour.");
        setTour(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Routing + Karte
  useEffect(() => {
    if (tour.length > 1) {
      const map = L.map("map", { center: [tour[0].lat, tour[0].lng], zoom: 10 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a>',
      }).addTo(map);

      tour.forEach((stopp) => L.marker([stopp.lat, stopp.lng]).addTo(map).bindPopup(stopp.adresse));

      L.Routing.control({
        waypoints: tour.map((s) => L.latLng(s.lat, s.lng)),
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: "red", weight: 4 }] },
      })
        .on("routeselected", () => {
          const c = document.querySelector(".leaflet-routing-container");
          if (c) c.style.display = "none";
        })
        .addTo(map);

      return () => map.remove();
    }
  }, [tour]);

  // PATCH Helfer (Speichern von Hinweis/Status)
  const patchStopp = async (stoppId, body) => {
    const res = await fetch(`${apiUrl}/stopps/${stoppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  // Google Maps Link
  const googleMapsLink = () => {
    if (tour.length === 0) return "#";
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(tour[0].adresse)}`;
    url += `&destination=${encodeURIComponent(tour[tour.length - 1].adresse)}`;
    if (tour.length > 2) {
      const waypoints = tour.slice(1, -1).map((s) => encodeURIComponent(s.adresse)).join("|");
      url += `&waypoints=${waypoints}`;
    }
    url += "&travelmode=driving";
    return url;
  };

  return (
    <div className="App">
      <h1>🚚 Tourenplan</h1>

      {/* Auswahl */}
      <div className="controls">
        <select value={selectedFahrer} onChange={(e) => setSelectedFahrer(e.target.value)}>
          <option value="">Fahrer auswählen</option>
          {fahrer.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
        <button onClick={ladeTour} disabled={loading}>Laden</button>
      </div>

      {/* Meldung */}
      {meldung && <div style={{ marginTop: 10, color: "red", fontWeight: "bold" }}>{meldung}</div>}

      {/* Tabelle */}
      {tour.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Ankunftszeit</th>
              <th>Kunde</th>
              <th>Kommission</th>
              <th>Adresse</th>
              <th>Telefon</th>
              <th>Hinweis</th>
              <th>Status (Text)</th>
              <th>Erledigt</th>
            </tr>
          </thead>
          <tbody>
            {tour.map((s, i) => (
              <tr key={s.stopp_id}>
                <td>{s.ankunftszeit || "08:00"}</td>
                <td>{s.kunde || `Kunde ${i + 1}`}</td>
                <td>{s.kommission || `KOM-${1000 + i}`}</td>
                <td>{s.adresse}</td>

                {/* Telefon klickbar */}
                <td>{s.telefon ? <a href={`tel:${s.telefon.replace(/\s+/g, "")}`}>{s.telefon}</a> : "-"}</td>

                {/* Hinweis editierbar */}
                <td>
                  <input
                    type="text"
                    defaultValue={s.hinweis || ""}
                    placeholder="Hinweis…"
                    onBlur={async (e) => {
                      const updated = await patchStopp(s.stopp_id, { hinweis: e.target.value });
                      const copy = [...tour];
                      copy[i] = { ...copy[i], hinweis: updated.hinweis };
                      setTour(copy);
                    }}
                    style={{ width: 180 }}
                  />
                </td>

                {/* Status-Text editierbar */}
                <td>
                  <textarea
                    defaultValue={s.status_text || ""}
                    placeholder="Status/Fahrer-Notiz…"
                    rows={2}
                    onBlur={async (e) => {
                      const updated = await patchStopp(s.stopp_id, { status_text: e.target.value });
                      const copy = [...tour];
                      copy[i] = { ...copy[i], status_text: updated.status_text };
                      setTour(copy);
                    }}
                    style={{ width: 220 }}
                  />
                </td>

                {/* Erledigt toggle */}
                <td>
                  <input
                    type="checkbox"
                    checked={!!s.erledigt}
                    onChange={async () => {
                      const r = await fetch(`${apiUrl}/scan`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stopp_id: s.stopp_id }),
                      });
                      const data = await r.json();
                      const copy = [...tour];
                      copy[i] = { ...copy[i], erledigt: data.erledigt };
                      setTour(copy);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Karte + GMaps Button */}
      {tour.length > 0 && (
        <>
          <div id="map" style={{ height: "600px", width: "100%", marginTop: 20, borderRadius: 12 }} />
          <div style={{ marginTop: 16 }}>
            <a href={googleMapsLink()} target="_blank" rel="noopener noreferrer">
              <button style={{ padding: "10px 20px", fontSize: 16 }}>➡️ Route in Google Maps öffnen</button>
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
