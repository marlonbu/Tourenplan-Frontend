import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const MapView = ({ stops }) => {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Firmenadresse (Startpunkt)
  const startAddress = "Hans Gehlenborg GmbH, Fehnstraße 3, 49699 Lindern";

  // Hilfsfunktion: Adresse → Koordinaten
  const getCoords = async (address) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
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
      // Alte Karte entfernen (falls neu geladen)
      if (mapRef.current) {
        mapRef.current.remove();
      }

      // Karte initialisieren
      const map = L.map("map", {
        center: [52.8412721, 7.7702298],
        zoom: 9,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const waypoints = [];

      // Startpunkt (Firma)
      const startCoords = await getCoords(startAddress);
      if (startCoords) {
        waypoints.push(L.latLng(startCoords[0], startCoords[1]));
        L.marker(startCoords)
          .addTo(map)
          .bindPopup("Start: Hans Gehlenborg GmbH");
      }

      // Stopps abarbeiten
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

      if (waypoints.length < 2) {
        console.warn("Nicht genug Wegpunkte für Routing.");
        return;
      }

      // Routing ohne Routenbeschreibung (Turn-by-Turn)
      setTimeout(() => {
        const control = L.Routing.control({
          waypoints,
          routeWhileDragging: false,
          lineOptions: {
            styles: [{ color: "#007bff", weight: 5 }],
          },
          createMarker: () => null,
          show: false, // keine Routenbeschreibung
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
        }).addTo(map);

        // Panel (Beschreibung) entfernen, falls Leaflet es dennoch erzeugt
        const panels = document.getElementsByClassName("leaflet-routing-container");
        if (panels.length > 0) {
          for (const p of panels) p.style.display = "none";
        }
      }, 500);

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
