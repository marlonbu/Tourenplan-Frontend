import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const active = (path) =>
    location.pathname === path ? "bg-white text-[#0058A3]" : "text-white hover:bg-blue-700/60";

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="flex flex-col justify-between bg-[#0058A3] text-white w-56 h-screen">
      {/* Oben: Hauptnavigation */}
      <div>
        <div className="flex items-center gap-2 p-4 text-lg font-semibold">
          <span role="img" aria-label="truck">🚚</span>
          <span className="text-white font-bold">Tourenplan</span>
        </div>
        <nav className="flex flex-col">
          <Link to="/planung" className={`px-4 py-3 ${active("/planung")}`}>
            Planung
          </Link>
          <Link to="/tagestour" className={`px-4 py-3 ${active("/tagestour")}`}>
            Tagestour
          </Link>
          <Link to="/gesamtuebersicht" className={`px-4 py-3 ${active("/gesamtuebersicht")}`}>
            Gesamtübersicht
          </Link>
        </nav>
      </div>

      {/* Unten: Admin + Logout */}
      <div className="p-4 border-t border-blue-800">
        <p className="text-sm mb-2">Gehlenborg<br /><span className="text-xs">Rolle: Admin</span></p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm hover:text-gray-300"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
