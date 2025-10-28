import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import Planung from "./pages/Planung";
import Tagestour from "./pages/Tagestour";

const API_URL = import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

const Layout = ({ children }) => {
  const location = useLocation();
  const active = (path) =>
    location.pathname === path ? "bg-white text-[#0058A3]" : "text-white hover:bg-blue-700/60";

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
          <div className="font-semibold text-xl text-white">Tourenplan</div>
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
          <button onClick={logout} className="underline opacity-90">
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [token, setToken] = React.useState(localStorage.getItem("token"));

  // 🔄 Automatisches Login, falls nur "Gehlenborg" im Storage steht
  useEffect(() => {
    const autoLogin = async () => {
      if (!token || token === "Gehlenborg") {
        try {
          const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "Gehlenborg", password: "Orga1023/" }),
          });
          const data = await res.json();
          if (data.token) {
            localStorage.setItem("token", data.token);
            setToken(data.token);
          }
        } catch (err) {
          console.error("Auto-Login fehlgeschlagen:", err);
        }
      }
      setLoading(false);
    };
    autoLogin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-[#0058A3] font-semibold text-lg">🔄 Lade Anwendung...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold text-[#0058A3] mb-4">Login erforderlich</h1>
          <p className="text-gray-600 mb-2">Bitte lade die Seite neu.</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/planung" replace />} />
          <Route path="/planung" element={<Planung />} />
          <Route path="/tagestour" element={<Tagestour />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
