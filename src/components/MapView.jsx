import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ stopps = [] }) {
  const mapId = "map-" + Math.random().toString(36).substring(7);
  const startpunkt = {
    name: "Hans Gehlenborg GmbH",
    adresse: "Fehnstraße 3, 49699 Lindern",
    lat: 52.8637,
    lng: 7.7747,
  };

  useEffect(() => {
    if (!stopps || stopps.length === 0) return;

    const map = L.map(mapId).setView([startpunkt.lat, startpunkt.lng], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    // Startpunkt-Marker (grün)
    const startIcon = L.divIcon({
      className:
        "flex items-center justify-center rounded-full bg-green-600 text-white font-bold",
      html: `<div style="background-color:#16a34a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">S</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker([startpunkt.lat, startpunkt.lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(`<b>${startpunkt.name}</b><br>${startpunkt.adresse}`);

    // Kunden-Marker (rot)
    const redIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -30],
    });

    const allCoords = [[startpunkt.lat, startpunkt.lng]];

    stopps.forEach((s) => {
      if (s.position && Array.isArray(s.position)) {
        const [lat, lng] = s.position;
        allCoords.push([lat, lng]);

        L.marker([lat, lng], { icon: redIcon })
          .addTo(map)
          .bindPopup(
            `<b>${s.kunde || "Unbekannt"}</b><br>${s.adresse || ""}`
          );
      }
    });

    // Karte auf alle Marker zoomen
    const bounds = L.latLngBounds(allCoords);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      map.remove();
    };
  }, [stopps]);

  // Google Maps Link generieren
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
      if (stopps.length > 1) {
        url += `&waypoints=${waypoints}`;
      }
    }
    url += `&travelmode=driving`;
    return url;
  };

  return (
    <div className="w-full">
      {/* Button oberhalb */}
      <div className="flex justify-end mb-3">
        <a
          href={buildGoogleMapsLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#0058A3] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-800 transition"
        >
          In Google Maps öffnen
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
