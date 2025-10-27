import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// -----------------------------------------------------------
//  Individueller Marker mit Nummerierung
// -----------------------------------------------------------
function createNumberedIcon(number) {
  return L.divIcon({
    html: `<div style="
        background:#0058A3;
        color:white;
        width:28px;
        height:28px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:13px;
        font-weight:bold;
        border:2px solid white;
        box-shadow:0 1px 4px rgba(0,0,0,0.3);
      ">${number}</div>`,
    className: "number-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// -----------------------------------------------------------
//  Auto-Zoom auf alle Stopps
// -----------------------------------------------------------
function FitBounds({ stopps }) {
  const map = useMap();

  useEffect(() => {
    if (!stopps?.length) return;
    const coords = stopps
      .filter((s) => Array.isArray(s.coords) && s.coords.length === 2)
      .map((s) => L.latLng(s.coords[0], s.coords[1]));
    if (coords.length) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [stopps, map]);

  return null;
}

// -----------------------------------------------------------
//  Haupt-Komponente
// -----------------------------------------------------------
export default function MapView({ stopps = [] }) {
  const hasCoords = stopps.filter(
    (s) => Array.isArray(s.coords) && s.coords.length === 2
  );

  // Startpunkt (Hans Gehlenborg GmbH, Fehnstraße 3, Lindern)
  const startCoords = [52.852776, 7.768832];

  // Linienverbindung (Startpunkt + Stopps)
  const polylineCoords = [startCoords, ...hasCoords.map((s) => s.coords)];

  return (
    <div className="table-container mb-6">
      <MapContainer
        center={startCoords}
        zoom={10}
        className="h-[500px] w-full rounded-lg shadow border border-gray-200"
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Startpunkt */}
        <Marker
          position={startCoords}
          icon={L.divIcon({
            html: `<div style="
              background:#00A86B;
              color:white;
              width:30px;
              height:30px;
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:14px;
              font-weight:bold;
              border:2px solid white;
              box-shadow:0 1px 4px rgba(0,0,0,0.3);
            ">S</div>`,
            className: "start-icon",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })}
        >
          <Popup>
            <strong>Startpunkt:</strong> Hans Gehlenborg GmbH
            <br />
            Fehnstraße 3 – 49699 Lindern
          </Popup>
        </Marker>

        {/* Stopps */}
        {hasCoords.map((s, i) => (
          <Marker key={s.id || i} position={s.coords} icon={createNumberedIcon(i + 1)}>
            <Popup>
              <strong>{s.kunde}</strong>
              <br />
              {s.adresse}
              {s.hinweis && (
                <>
                  <br />
                  <em>{s.hinweis}</em>
                </>
              )}
            </Popup>
          </Marker>
        ))}

        {/* Verbindungslinie */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            color="#0058A3"
            weight={4}
            opacity={0.7}
          />
        )}

        <FitBounds stopps={stopps} />
      </MapContainer>
    </div>
  );
}
