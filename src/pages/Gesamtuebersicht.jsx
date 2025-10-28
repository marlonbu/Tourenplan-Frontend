import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Gesamtuebersicht() {
  const [touren, setTouren] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.listTouren()
      .then(setTouren)
      .catch(() => setMsg("❌ Fehler beim Laden der Touren"));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0058A3]">Gesamtübersicht</h1>

      {msg && (
        <div
          className={`px-4 py-3 rounded-md text-sm ${
            msg.startsWith("❌")
              ? "bg-red-50 border border-red-300 text-red-700"
              : "bg-green-50 border border-green-300 text-green-700"
          }`}
        >
          {msg}
        </div>
      )}

      {touren.length === 0 ? (
        <p className="text-sm text-gray-500">Noch keine Touren vorhanden.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#0058A3] text-white">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Datum</th>
                <th className="px-3 py-2 text-left">Fahrer</th>
              </tr>
            </thead>
            <tbody>
              {touren.map((t) => (
                <tr key={t.id} className="odd:bg-gray-50">
                  <td className="px-3 py-2">{t.id}</td>
                  <td className="px-3 py-2">{t.datum}</td>
                  <td className="px-3 py-2">{t.fahrer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
