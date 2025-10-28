import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Tagestour from "./pages/Tagestour";
import Planung from "./pages/Planung";
import Gesamtuebersicht from "./pages/Gesamtuebersicht";
import Login from "./pages/Login";

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  if (!token) {
    return <Login onLoginSuccess={(t) => { setToken(t); navigate("/planung"); }} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0058A3] text-white flex flex-col justify-between">
        <div>
          <div className="text-center py-6 text-lg font-bold border-b border-blue-800">
            🚛 <span className="text-white">Tourenplan</span>
          </div>
          <nav className="flex flex-col mt-4">
            <button
              onClick={() => navigate("/planung")}
              className="px-4 py-3 text-left hover:bg-blue-700 transition"
            >
              Planung
            </button>
            <button
              onClick={() => navigate("/tagestour")}
              className="px-4 py-3 text-left hover:bg-blue-700 transition"
            >
              Tagestour
            </button>
            <button
              onClick={() => navigate("/gesamtuebersicht")}
              className="px-4 py-3 text-left hover:bg-blue-700 transition"
            >
              Gesamtübersicht
            </button>
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-blue-800 text-sm">
          <div className="mb-1 font-semibold">Gehlenborg</div>
          <div className="text-xs text-blue-200 mb-2">Rolle: Admin</div>
          <button
            onClick={handleLogout}
            className="text-left text-white hover:underline text-sm flex items-center gap-1"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Hauptinhalt */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/planung" element={<Planung />} />
          <Route path="/tagestour" element={<Tagestour />} />
          <Route path="/gesamtuebersicht" element={<Gesamtuebersicht />} />
          <Route path="*" element={<Planung />} />
        </Routes>
      </main>
    </div>
  );
}
