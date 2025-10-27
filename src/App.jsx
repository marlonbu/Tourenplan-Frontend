import React, { useState, useEffect } from "react";
import Tagestour from "./pages/Tagestour";
import Planung from "./pages/Planung";
import Gesamtuebersicht from "./pages/Gesamtuebersicht";
import { Menu, X, LogOut } from "lucide-react";
import { api } from "./api";

export default function App() {
  const [activeTab, setActiveTab] = useState("Tagestour");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      });
  }, []);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
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
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full bg-[#0058A3] text-white w-64 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 z-50 shadow-lg flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-700">
          <h1 className="text-lg font-semibold">🚛 Tourenplan</h1>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col mt-4">
          {["Tagestour", "Planung", "Gesamtübersicht"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                setSidebarOpen(false);
              }}
              className={`text-left px-6 py-3 font-medium transition ${
                activeTab === t
                  ? "bg-blue-900"
                  : "hover:bg-blue-800 text-blue-100"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Profilbereich unten */}
        {user && (
          <div className="mt-auto border-t border-blue-700 p-4 text-sm text-blue-100">
            <p className="font-medium">{user.username}</p>
            <p className="text-xs opacity-80 mb-2">
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

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={26} className="text-[#0058A3]" />
          </button>
          <h2 className="text-lg font-semibold text-[#0058A3]">{activeTab}</h2>
        </header>

        {/* Inhalt */}
        <main className="flex-1 p-4 md:p-8">{renderContent()}</main>
      </div>
    </div>
  );
}
