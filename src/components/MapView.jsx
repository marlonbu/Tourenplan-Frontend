import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const MapView = ({ stops }) => {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Firmenadresse als Startpunkt
  const startAddress = "Hans Gehlenborg GmbH, Fehnstraße 3, 49699 Lindern";

  // Geocoding Funktion (Adresse → Koordinaten)
  const getCoords = async (address) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      } else {
        console.warn("Keine Koordinaten gefunden für:", address);
        return null;
      }
    } catch (err) {
      console.error("Fehler beim Geocoding:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!stops || stops.length === 0) return;

    const initMap = async () => {
      // Existierende Karte entfernen (wenn bereits vorhanden)
      if (mapRef.current) {
        mapRef.current.remove();
      }

      // Karte initialisieren (Start auf Lindern)
      const map = L.map("map", {
        center: [52.8412721, 7.7702298],
        zoom: 9,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Warte auf alle Koordinaten (Start + Stopps)
      const waypoints = [];

      // Startpunkt hinzufügen
      const startCoords = await getCoords(startAddress);
      if (startCoords) {
        waypoints.push(L.latLng(startCoords[0], startCoords[1]));
        L.marker(startCoords)
          .addTo(map)
          .bindPopup("Start: Hans Gehlenborg GmbH")
          .openPopup();
      }

      // Stopps nacheinander auflösen
      for (const stop of stops) {
        if (stop.adresse) {
          const coords = await getCoords(stop.adresse);
          if (coords) {
            waypoints.push(L.latLng(coords[0], coords[1]));
            L.marker(coords)
              .addTo(map)
              .bindPopup(`${stop.kunde || "Kunde"}<br/>${stop.adresse}`);
          }
        }
      }

      // Wenn keine gültigen Wegpunkte → abbrechen
      if (waypoints.length < 2) {
        console.warn("Nicht genug Wegpunkte für Routing.");
        return;
      }

      // Routing erst starten, wenn alles fertig ist
      setTimeout(() => {
        L.Routing.control({
          waypoints,
          routeWhileDragging: false,
          lineOptions: {
            styles: [{ color: "#007bff", weight: 5 }],
          },
          createMarker: () => null, // keine extra Marker vom Routing-Plugin
        }).addTo(map);
      }, 500); // kleine Verzögerung für stabileren Aufbau

      setMapReady(true);
    };

    initMap();
  }, [stops]);

  return (
    <div style={{ width: "100%", height: "400px", marginTop: "1rem" }}>
      <div
        id="map"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      ></div>
      {!mapReady && (
        <p style={{ textAlign: "center", marginTop: "8px", color: "#555" }}>
          Karte wird geladen...
        </p>
      )}
    </div>
  );
};

export default MapView;
