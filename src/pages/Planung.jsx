import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const fmtDate = (d) => {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function Planung() {
  const [fahrer, setFahrer] = useState([]);
  const [fahrerId, setFahrerId] = useState("");
  const [datum, setDatum] = useState(fmtDate(new Date()));
  const [tour, setTour] = useState(null);
  const [stopps, setStopps] = useState([]);
  const [meldung, setMeldung] = useState("");

  // Formular: Stopp
  const [fKunde, setFKunde] = useState("");
  const [fAdresse, setFAdresse] = useState("");
  const [fKommission, setFKommission] = useState("");
  const [fHinweis, setFHinweis] = useState("");
  const [fTelefon, setFTelefon] = useState("");
  const [fAnkunft, setFAnkunft] = useState("");
  const [fPosition, setFPosition] = useState( (stopps?.length || 0) + 1 );

  // Fahrer laden
  const ladeFahrer = async () => {
    try {
      const data = await api.listFahrer();
      setFahrer(data);
      if (!fahrerId && data.length) setFahrerId(String(data[0].id));
    } catch {
      setMeldung("❌ Fehler beim Laden der Fahrer");
    }
  };

  useEffect(() => { ladeFahrer(); }, []); // nur einmal

  const kannTourAktion = useMemo(() => !!fahrerId && !!datum, [fahrerId, datum]);

  // Tour holen
  const ladeTour = async () => {
    if (!kannTourAktion) return;
    try {
      const data = await api.getTour(fahrerId, datum);
      setTour(data.tour);
      setStopps(data.stopps || []);
      setFPosition((data.stopps?.length || 0) + 1);
      setMeldung("");
    } catch {
      setMeldung("❌ Fehler beim Laden der Tour");
    }
  };

  // Tour anlegen
  const createTour = async () => {
    if (!kannTourAktion) return;
    try {
      const t = await api.createTour(fahrerId, datum);
      setTour(t);
      setStopps([]);
      setFPosition(1);
      setMeldung("✅ Tour angelegt");
    } catch {
      setMeldung("❌ Fehler beim Anlegen der Tour");
    }
  };

  // Stopp hinzufügen
  const addStopp = async () => {
    if (!tour?.id) { setMeldung("❌ Bitte erst Tour anlegen/laden"); return; }
    if (!fKunde.trim() || !fAdresse.trim()) { setMeldung("❌ Kunde & Adresse erforderlich"); return; }
    try {
      const payload = {
        kunde: fKunde, adresse: fAdresse, kommission: fKommission,
        hinweis: fHinweis, telefon: fTelefon, ankunft: fAnkunft || null,
        position: Number(fPosition) || 0, status: "offen",
      };
      const s = await api.addStopp(tour.id, payload);
      setStopps((prev) => [...prev, s].sort((a,b)=> (a.position??0)-(b.position??0) || a.id-b.id));
      // Formular leeren
      setFKunde(""); setFAdresse(""); setFKommission(""); setFHinweis("");
      setFTelefon(""); setFAnkunft("");
      setFPosition((prev)=> (prev||0) + 1);
      setMeldung("✅ Stopp gespeichert");
    } catch {
      setMeldung("❌ Fehler beim Speichern des Stopps");
    }
  };

  // Stopp updaten (inline)
  const updateStopp = async (row) => {
    try {
      const u = await api.updateStopp(row.id, {
        kunde: row.kunde, adresse: row.adresse, kommission: row.kommission,
        hinweis: row.hinweis, telefon: row.telefon, status: row.status,
        ankunft: row.ankunft || null, position: Number(row.position) || 0,
      });
      setStopps((prev)=> prev.map((s)=> s.id===u.id ? u : s).sort((a,b)=> (a.position??0)-(b.position??0) || a.id-b.id));
      setMeldung("✅ Stopp aktualisiert");
    } catch {
      setMeldung("❌ Fehler beim Aktualisieren");
    }
  };

  // Stopp löschen
  const deleteStopp = async (id) => {
    if (!confirm("Stopp wirklich löschen?")) return;
    try {
      await api.deleteStopp(id);
      setStopps((prev)=> prev.filter((s)=> s.id!==id));
      setMeldung("✅ Stopp gelöscht");
    } catch {
      setMeldung("❌ Fehler beim Löschen");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0058A3]">Tourenplanung</h1>

      {/* Kopf: Fahrer/Datum/Aktionen */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm text-gray-600">Fahrer</label>
            <select
              value={fahrerId}
              onChange={(e) => setFahrerId(e.target.value)}
              className="mt-1 border rounded-md px-3 py-2 w-full"
            >
              {fahrer.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Datum</label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="mt-1 border rounded-md px-3 py-2 w-full"
            />
          </div>

          <button
            onClick={ladeTour}
            className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition h-10 md:mt-6"
          >
            Tour laden
          </button>

          <button
            onClick={createTour}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition h-10 md:mt-6"
          >
            Tour anlegen
          </button>
        </div>

        {tour && (
          <p className="mt-3 text-sm text-gray-500">
            Tour-ID: <span className="font-mono">{tour.id}</span> – {datum}
          </p>
        )}
      </div>

      {/* Stopp hinzufügen */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-[#0058A3]">Stopp hinzufügen</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="border rounded-md px-3 py-2" placeholder="Kunde *" value={fKunde} onChange={(e)=>setFKunde(e.target.value)} />
          <input className="border rounded-md px-3 py-2 md:col-span-2" placeholder="Adresse *" value={fAdresse} onChange={(e)=>setFAdresse(e.target.value)} />
          <input className="border rounded-md px-3 py-2" placeholder="Kommission" value={fKommission} onChange={(e)=>setFKommission(e.target.value)} />
          <input className="border rounded-md px-3 py-2" placeholder="Telefon" value={fTelefon} onChange={(e)=>setFTelefon(e.target.value)} />
          <input className="border rounded-md px-3 py-2" type="time" placeholder="Ankunft" value={fAnkunft} onChange={(e)=>setFAnkunft(e.target.value)} />
          <input className="border rounded-md px-3 py-2" type="number" min="0" placeholder="Position" value={fPosition} onChange={(e)=>setFPosition(e.target.value)} />
          <input className="border rounded-md px-3 py-2 md:col-span-3" placeholder="Hinweis" value={fHinweis} onChange={(e)=>setFHinweis(e.target.value)} />
          <div className="md:col-span-3 flex items-center">
            <button onClick={addStopp} className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition">
              Stopp speichern
            </button>
          </div>
        </div>
      </div>

      {/* Stopps-Liste */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-[#0058A3]">Stopps</h2>

        {stopps.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine Stopps vorhanden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#0058A3] text-white">
                  <th className="px-3 py-2 text-left">Pos</th>
                  <th className="px-3 py-2 text-left">Kunde</th>
                  <th className="px-3 py-2 text-left">Adresse</th>
                  <th className="px-3 py-2 text-left">Kommission</th>
                  <th className="px-3 py-2 text-left">Telefon</th>
                  <th className="px-3 py-2 text-left">Ankunft</th>
                  <th className="px-3 py-2 text-left">Hinweis</th>
                  <th className="px-3 py-2 text-left">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {stopps.map((s) => (
                  <tr key={s.id} className="odd:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-16 border rounded px-2 py-1"
                        value={s.position ?? 0}
                        onChange={(e)=> setStopps(prev => prev.map(x=> x.id===s.id ? {...x, position: e.target.value} : x))}
                        onBlur={()=> updateStopp(stopps.find(x=> x.id===s.id))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="border rounded px-2 py-1 w-40"
                        value={s.kunde || ""}
                        onChange={(e)=> setStopps(prev => prev.map(x=> x.id===s.id ? {...x, kunde: e.target.value} : x))}
                        onBlur={()=> updateStopp(stopps.find(x=> x.id===s.id))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="border rounded px-2 py-1 w-64"
                        value={s.adresse || ""}
                        onChange={(e)=> setStopps(prev => prev.map(x=> x.id===s.id ? {...x, adresse: e.target.value} : x))}
                        onBlur={()=> updateStopp(stopps.find(x=> x.id===s.id))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="border rounded px-2 py-1 w-40"
                        value={s.kommission || ""}
                        onChange={(e)=> setStopps(prev => prev.map(x=> x.id===s.id ? {...x, kommission: e.target.value} : x))}
                        onBlur={()=> updateStopp(stopps.find(x=> x.id===s.id))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {s.telefon ? (
                        <a className="text-[#0058A3] underline" href={`tel:${s.telefon}`}>{s.telefon}</a>
                      ) : (
                        <input
                          className="border rounded px-2 py-1 w-36"
                          value={s.telefon || ""}
                          onChange={(e)=> setStopps(prev => prev.map(x=> x.id===s.id ? {...x, telefon: e.target.value} : x))}
                          onBlur={()=> updateStopp(stopps.find(x=> x.id===s.id))}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="time"
                        className="border rounded px-2 py-1 w-28"
                        value={s.ankunft || ""}
                        onChange={(e)=> setStopps(prev => prev.map(x=> x.id===s.id ? {...x, ankunft: e.target.value} : x))}
                        onBlur={()=> updateStopp(stopps.find(x=> x.id===s.id))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="border rounded px-2 py-1 w-64"
                        value={s.hinweis || ""}
                        onChange={(e)=> setStopps(prev => prev.map(x=> x.id===s.id ? {...x, hinweis: e.target.value} : x))}
                        onBlur={()=> updateStopp(stopps.find(x=> x.id===s.id))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={()=> deleteStopp(s.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                      >
                        Löschen 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meldung && (
        <div className={`px-4 py-3 rounded-md text-sm ${
          meldung.startsWith("❌") ? "bg-red-50 border border-red-300 text-red-700"
                                   : "bg-green-50 border border-green-300 text-green-700"
        }`}>
          {meldung}
        </div>
      )}
    </div>
  );
}
