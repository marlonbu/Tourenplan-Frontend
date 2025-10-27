// src/components/MapView.jsx
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";

export default function MapView({ stopps = [] }) {
  if (!stopps.length) return <div style={{ height: 300 }}>Keine Stopps vorhanden</div>;

  const start = [52.8446, 7.7729]; // Hans Gehlenborg GmbH, Lindern
  const positions = [start, ...stopps.map((s) => s.coords).filter(Boolean)];

  return (
    <div style={{ height: "60vh", marginBottom: 16 }}>
      <MapContainer
        center={start}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        <Marker position={start} icon={createIcon("S")}>
          <Popup>Startpunkt: Hans Gehlenborg GmbH</Popup>
        </Marker>
        {stopps.map((s, i) =>
          s.coords ? (
            <Marker key={s.id} position={s.coords} icon={createIcon(String(i + 1))}>
              <Popup>
                <b>{s.kunde}</b>
                <br />
                {s.adresse}
              </Popup>
            </Marker>
          ) : null
        )}
        <Polyline positions={positions} color="blue" />
      </MapContainer>
    </div>
  );
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [positions, map]);
  return null;
}

function createIcon(label) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:#007bff;color:#fff;border-radius:50%;width:28px;height:28px;line-height:28px;text-align:center;font-weight:bold;">${label}</div>`,
    iconSize: [28, 28],
  });
}
