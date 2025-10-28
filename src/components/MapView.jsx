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

  // Adressen in Koordinaten umwandeln (mit Fallback)
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
              found: true,
            });
          } else {
            console.warn("Adresse nicht gefunden:", s.adresse);
            results.push({
              ...s,
              lat: null,
              lng: null,
              found: false,
            });
          }
        } catch (err) {
          console.error("Geocoding-Fehler:", err);
          results.push({
            ...s,
            lat: null,
            lng: null,
            found: false,
          });
        }
      }

      setCoords(results);
    }

    geocode();
  }, [stopps]);

  // Karte + Route aufbauen
  useEffect(() => {
    if (!coords || coords.length === 0) return;

    const map = L.map(mapId).setView([startpunkt.lat, startpunkt.lng], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    const allCoords = [[startpunkt.lat, startpunkt.lng]];

    // Startpunkt
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

    // Stopps darstellen (auch mit Fallback)
    coords.forEach((s) => {
      if (s.lat && s.lng) {
        allCoords.push([s.lat, s.lng]);
        L.marker([s.lat, s.lng], { icon: redIcon })
          .addTo(map)
          .bindPopup(
            `<b>${s.kunde || "Unbekannt"}</b><br>${
              s.adresse || ""
            }<br><i>Adresse gefunden</i>`
          );
      } else {
        // Fallback-Marker
        L.marker([startpunkt.lat, startpunkt.lng], { icon: redIcon })
          .addTo(map)
          .bindPopup(
            `<b>${s.kunde || "Unbekannt"}</b><br><i>Adresse nicht gefunden</i>`
          );
      }
    });

    // Karte auf alle Punkte zoomen
    const bounds = L.latLngBounds(allCoords);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Routenlinie abrufen
    async function ladeRoute() {
      if (allCoords.length < 2) return;

      const coordString = allCoords
        .map((c) => `${c[1]},${c[0]}`)
        .join("|");

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`
        );
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry;
          L.geoJSON(route, {
            style: {
              color: "#0058A3",
              weight: 4,
              opacity: 0.8,
            },
          }).addTo(map);
        }
      } catch (err) {
        console.error("Routing-Fehler:", err);
      }
    }

    ladeRoute();

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
