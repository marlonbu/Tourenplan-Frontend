import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

/**
 * MapView
 * - Zeigt OSM-Karte mit Routing von Start-Adresse bis zum letzten Stopp
 * - Adressen werden per Nominatim (OSM) in Koordinaten geokodiert (kein API-Key nötig)
 * - Routing über OSRM (Leaflet Routing Machine) -> echte Straßenroute
 *
 * Props:
 * - startAddress: string (Abfahrtsort, z.B. "Hans Gehlenborg GmbH, Fehnstraße 3, 49699 Lindern")
 * - stops: Array<{ id:number, adresse:string, kunde?:string }>
 * - visible: boolean (Karte anzeigen/ausblenden)
 */
export default function MapView({ startAddress, stops = [], visible = true }) {
  const mapRef = useRef(null);
  const routingRef = useRef(null);

  // Hilfsfunktion: Adresse -> {lat,lng} via Nominatim
  const geocode = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;
    const res = await fetch(url, {
      headers: {
        // höfliche Identifikation
        "Accept-Language": "de",
      },
    });
    const data = await res.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  };

  useEffect(() => {
    if (!visible) return;

    let isCancelled = false;

    const setupRouting = async () => {
      if (!mapRef.current) return;
      // Karte-Instanz aus react-leaflet holen
      const map = mapRef.current;

      // Waypoints per Geocoding bauen (Start + alle Stopps in Reihenfolge)
      const waypoints = [];
      const start = await geocode(startAddress);
      if (isCancelled) return;

      if (start) waypoints.push(L.latLng(start.lat, start.lng));

      for (const s of stops) {
        const pos = await geocode(s.adresse);
        if (isCancelled) return;
        if (pos) waypoints.push(L.latLng(pos.lat, pos.lng));
      }

      // Wenn weniger als 2 Punkte vorhanden, abbrechen (kein Routing möglich)
      if (waypoints.length < 2) {
        // ggf. nur auf Start zoomen
        if (start) {
          map.setView([start.lat, start.lng], 12);
        }
        return;
      }

      // Bereits existierende Route entfernen
      if (routingRef.current) {
        map.removeControl(routingRef.current);
        routingRef.current = null;
      }

      // Routing Control hinzufügen
      const control = L.Routing.control({
        waypoints,
        addWaypoints: false,
        routeWhileDragging: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        lineOptions: {
          styles: [{ color: "#1f6feb", opacity: 0.9, weight: 6 }],
        },
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "driving",
          language: "de",
        }),
        createMarker: function(i, wp) {
          // Standard-Marker, Popups optional
          return L.marker(wp.latLng);
        },
      });

      control.addTo(map);
      routingRef.current = control;
    };

    setupRouting();

    return () => {
      isCancelled = true;
      if (routingRef.current && mapRef.current) {
        try {
          mapRef.current.removeControl(routingRef.current);
        } catch (_) {}
        routingRef.current = null;
      }
    };
  }, [visible, startAddress, JSON.stringify(stops)]);

  // Leaflet MapContainer braucht Zentrum/Zoom, wird aber von Routing überschrieben
  return (
    <div className="map-card" style={{ display: visible ? "block" : "none" }}>
      <MapContainer
        className="map-container"
        center={[52.85, 7.77]}  // Fallback: Nähe Lindern
        zoom={12}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
