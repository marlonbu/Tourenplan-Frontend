import React, { useEffect, useState } from "react";
import "../App.css";

function getWeekDates(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Montag als Wochenstart
  const monday = new Date(d.setDate(diff));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    days.push(current.toISOString().slice(0, 10));
  }
  return days;
}

export default function WeekView({
  apiUrl,
  token,
  fahrer,
  selectedFahrer,
  setSelectedFahrer,
}) {
  const [datum, setDatum] = useState(() => new Date().toISOString().slice(0, 10));
  const [wochenDaten, setWochenDaten] = useState({});
  const [loading, setLoading] = useState(false);

  const ladeWoche = async () => {
    if (!selectedFahrer || !datum) return;
    setLoading(true);
    const tage = getWeekDates(datum);
    const result = {};
    for (const day of tage) {
      try {
        const res = await fetch(`${apiUrl}/touren/${selectedFahrer}/${day}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.stopps?.length) result[day] = data.stopps;
      } catch (err) {
        console.error("Fehler bei Tag", day, err);
      }
    }
    setWochenDaten(result);
    setLoading(false);
  };

  useEffect(() => {
    ladeWoche();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFahrer, datum]);

  return (
    <div className="weekview">
      <div className="controls">
        <select
          value={selectedFahrer}
          onChange={(e) => setSelectedFahrer(e.target.value)}
        >
          <option value="">Fahrer wählen</option>
          {fahrer.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
        />
        <button onClick={ladeWoche}>{loading ? "Laden..." : "Woche laden"}</button>
      </div>

      <div className="week-table-container">
        {Object.keys(wochenDaten).length === 0 && !loading && (
          <p className="muted">Keine Daten für diese Woche.</p>
        )}
        {Object.entries(wochenDaten).map(([day, stopps]) => (
          <div key={day} className="week-day-card">
            <h3>
              {new Date(day).toLocaleDateString("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
              })}
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Kunde</th>
                  <th>Adresse</th>
                  <th>Telefon</th>
                  <th>Hinweis</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s, i) => (
                  <tr key={i}>
                    <td>{s.kunde}</td>
                    <td>{s.adresse}</td>
                    <td>
                      {s.telefon ? (
                        <a href={`tel:${s.telefon}`}>{s.telefon}</a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{s.hinweis || "-"}</td>
                    <td>{s.status || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
