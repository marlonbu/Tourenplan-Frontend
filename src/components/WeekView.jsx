import React, { useEffect, useState } from "react";
import "../App.css";

// Hilfsfunktion: alle Kalenderwochen mit Start/Ende generieren
function getWeeksOfYear(year) {
  const weeks = [];
  const d = new Date(year, 0, 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1); // Montag finden
  let week = 1;
  while (d.getFullYear() === year) {
    const start = new Date(d);
    const end = new Date(d);
    end.setDate(start.getDate() + 6);
    const label = `KW ${String(week).padStart(2, "0")} (${start
      .toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
     - ${end.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })})`;
    weeks.push({ week, start, end, label });
    d.setDate(d.getDate() + 7);
    week++;
  }
  return weeks;
}

export default function WeekView({ apiUrl, token, fahrer, selectedFahrer }) {
  const [wochenDaten, setWochenDaten] = useState({});
  const [loading, setLoading] = useState(false);
  const [year] = useState(new Date().getFullYear());
  const [weeks] = useState(() => getWeeksOfYear(new Date().getFullYear()));

  const currentWeek = (() => {
    const now = new Date();
    const week = weeks.find(
      (w) => now >= w.start && now <= w.end
    );
    return week || weeks[0];
  })();

  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const ladeWoche = async (weekObj) => {
    if (!selectedFahrer || !weekObj) return;
    setLoading(true);
    const tage = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekObj.start);
      day.setDate(day.getDate() + i);
      tage.push(day.toISOString().slice(0, 10));
    }

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
    ladeWoche(selectedWeek);
  }, [selectedWeek, selectedFahrer]);

  return (
    <div className="weekview">
      <div className="kw-select-container">
        <label>Kalenderwoche:</label>
        <div className="kw-dropdown">
          <select
            size="6"
            value={selectedWeek.label}
            onChange={(e) =>
              setSelectedWeek(
                weeks.find((w) => w.label === e.target.value) || weeks[0]
              )
            }
          >
            {weeks.map((w) => (
              <option key={w.week} value={w.label}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="muted">Lade Woche...</p>}

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
                  <th>Fahrer</th>
                  <th>Kunde</th>
                  <th>Kommission</th>
                  <th>Hinweis</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s, i) => (
                  <tr key={i}>
                    <td>
                      {
                        fahrer.find((f) => f.id === selectedFahrer)?.name ||
                        "-"
                      }
                    </td>
                    <td>{s.kunde}</td>
                    <td>{s.kommission}</td>
                    <td>{s.hinweis || "-"}</td>
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
