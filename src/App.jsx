import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import Tagestour from "./pages/Tagestour";
import Planung from "./pages/Planung";
import Gesamtuebersicht from "./pages/Gesamtuebersicht";
import Login from "./pages/Login";
import { api } from "./api";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("Tagestour");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.me().then(setUser).catch(() => {
      localStorage.removeItem("token");
      navigate("/login");
    });
  }, [navigate]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Tagestour":
        return <Tagestour />;
      case "Planung":
        return <Planung />;
      case "Gesamtübersicht":
        return <Gesamtuebersicht />;
      default:
        return <Tagestour />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0058A3] text-white flex flex-col justify-between shadow-lg">
        <div>
          <div className="px-6 py-5 border-b border-blue-700">
            <h1 className="text-xl font-semibold tracking-wide">
              🚛 Tourenplan
            </h1>
          </div>

          <nav className="mt-6 flex flex-col">
            {["Tagestour", "Planung", "Gesamtübersicht"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-6 py-3 text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-blue-900"
                    : "hover:bg-blue-800 text-blue-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Profilbereich unten */}
        {user && (
          <div className="border-t border-blue-700 p-5 text-sm">
            <p className="font-semibold">{user.username || "Gehlenborg"}</p>
            <p className="text-xs text-blue-200 mb-3">
              Rolle: {user.role === "admin" ? "Admin" : "Fahrer"}
            </p>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-red-300 hover:text-red-100 transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
