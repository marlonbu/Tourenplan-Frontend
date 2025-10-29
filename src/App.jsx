import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Planung from "./pages/Planung";
import Tagestour from "./pages/Tagestour";

export default function App() {
  const active = (path) =>
    location.pathname === path
      ? "bg-white text-[#0058A3]"
      : "text-white hover:bg-blue-700/60";

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0058A3] text-white flex flex-col">
        <div className="p-5 border-b border-white/20 flex items-center gap-2">
          <span className="text-2xl">🚚</span>
          <div className="font-semibold text-xl">Tourenplan</div>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          <Link to="/planung" className={`block px-4 py-2 rounded-md ${active("/planung")}`}>
            Planung
          </Link>
          <Link to="/tagestour" className={`block px-4 py-2 rounded-md ${active("/tagestour")}`}>
            Tagestour
          </Link>
        </nav>

        <div className="p-4 border-t border-white/20 text-sm space-y-1">
          <div className="opacity-90">Gehlenborg • Admin</div>
          <button onClick={logout} className="underline opacity-90">Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/planung" replace />} />
          <Route path="/planung" element={<Planung />} />
          <Route path="/tagestour" element={<Tagestour />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}
