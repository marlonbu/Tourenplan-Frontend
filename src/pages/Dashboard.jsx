import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    tourenHeute: 0,
    stoppsOffen: 0,
    stoppsFertig: 0,
    fotos: 0,
  });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const [touren, stopps] = await Promise.all([
          api.getTourenHeute?.(),
          api.getStopps?.(),
        ]);

        const heute = new Date().toISOString().split("T")[0];
        const tourenHeute = touren?.filter((t) => t.datum === heute).length || 0;
        const stoppsOffen =
          stopps?.filter((s) => s.status === "offen").length || 0;
        const stoppsFertig =
          stopps?.filter((s) => s.status === "fertig").length || 0;
        const fotos = stopps?.filter((s) => s.foto_url).length || 0;

        setStats({ tourenHeute, stoppsOffen, stoppsFertig, fotos });
      } catch (err) {
        console.warn("Dashboard-Daten konnten nicht geladen werden:", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#0058A3]">
          Willkommen bei Gehlenborg Tourenplan 🚛
        </h1>
        <p className="text-gray-600 mt-2 sm:mt-0">
          {time.toLocaleDateString("de-DE")} – {time.toLocaleTimeString("de-DE")}
        </p>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Touren heute"
          value={stats.tourenHeute}
          color="bg-[#0058A3]"
          icon="🚛"
        />
        <StatCard
          title="Offene Stopps"
          value={stats.stoppsOffen}
          color="bg-yellow-500"
          icon="📍"
        />
        <StatCard
          title="Abgeschlossen"
          value={stats.stoppsFertig}
          color="bg-green-600"
          icon="✅"
        />
        <StatCard
          title="Fotos hochgeladen"
          value={stats.fotos}
          color="bg-blue-400"
          icon="📷"
        />
      </div>

      {/* Hinweis */}
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-700 leading-relaxed">
          Hier siehst du eine Zusammenfassung deiner aktuellen Tourenaktivität.
          Über die Tabs in der linken Seitenleiste kannst du Touren planen,
          ansehen oder bearbeiten.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div
      className={`${color} text-white rounded-xl shadow-md p-5 flex flex-col justify-between`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <div>
        <h3 className="text-sm uppercase tracking-wide opacity-90">{title}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}
