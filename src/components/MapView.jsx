import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ stopps = [] }) {
  const [coords, setCoords] = useState([]);
  const mapId = "map-" + Math.random().toString(36).substring(7);

  const startpunkt = {
    name: "Hans Gehlenborg GmbH",
    adresse: "Fehnstraße 3, 49699 Lindern",
    lat: 52.8637,
    lng: 7.7747,
  };

  // Adressen automatisch in Koordinaten umwandeln
  useEffect(() => {
    async function geocode() {
      if (!stopps || stopps.length === 0) return;
      const results = [];
      for (const s of stopps) {
        try {
          const q = encodeURIComponent(s.adresse);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${q}`
          );
          const data = await res.json();
          if (data.length > 0) {
            results.push({
              ...s,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          }
        } catch (err) {
          console.error("Geocoding-Fehler:", err);
        }
      }
      setCoords(results);
    }
    geocode();
  }, [stopps]);

  // Karte aufbauen
  useEffect(() => {
    if (!coords || coords.length === 0) return;

    const map = L.map(mapId).setView([startpunkt.lat, startpunkt.lng], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    // Startpunkt-Marker
    const startIcon = L.divIcon({
      html: `<div style="background-color:#16a34a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">S</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker([startpunkt.lat, startpunkt.lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(`<b>${startpunkt.name}</b><br>${startpunkt.adresse}`);

    const redIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -30],
    });

    const allCoords = [[startpunkt.lat, startpunkt.lng]];

    coords.forEach((s) => {
      allCoords.push([s.lat, s.lng]);
      L.marker([s.lat, s.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(`<b>${s.kunde || "Unbekannt"}</b><br>${s.adresse || ""}`);
    });

    // Auto-Zoom auf alle Punkte
    const bounds = L.latLngBounds(allCoords);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => map.remove();
  }, [coords]);

  // Google Maps Link
  const buildGoogleMapsLink = () => {
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      startpunkt.adresse
    )}`;
    if (stopps.length > 0) {
      const waypoints = stopps
        .map((s) => encodeURIComponent(s.adresse))
        .filter(Boolean)
        .join("|");
      url += `&destination=${encodeURIComponent(
        stopps[stopps.length - 1].adresse
      )}`;
      if (stopps.length > 1) url += `&waypoints=${waypoints}`;
    }
    url += `&travelmode=driving`;
    return url;
  };

  return (
    <div className="w-full">
      {/* zentrierter Button */}
      <div className="flex justify-center mb-4">
        <a
          href={buildGoogleMapsLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#0058A3] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-800 transition"
        >
          📍 In Google Maps öffnen
        </a>
      </div>

      {/* Karte */}
      <div
        id={mapId}
        className="w-full h-[500px] rounded-lg shadow-inner border border-gray-200"
      ></div>
    </div>
  );
}
