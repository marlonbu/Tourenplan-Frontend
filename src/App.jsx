import React, { useState } from "react";
import Tagestour from "./pages/Tagestour";
import Planung from "./pages/Planung";
import Gesamtuebersicht from "./pages/Gesamtuebersicht";

export default function App() {
  const [activeTab, setActiveTab] = useState("tagestour");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* HEADER */}
      <header className="bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#0058A3] tracking-tight">
            Möbel Gehlenborg Tourenplan
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="text-sm font-semibold text-gray-600 hover:text-[#0058A3] transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav className="bg-white shadow-sm mt-1">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 py-2">
          {[
            { id: "tagestour", label: "Tagestour" },
            { id: "planung", label: "Planung" },
            { id: "gesamt", label: "Gesamtübersicht" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-md font-semibold transition ${
                activeTab === tab.id
                  ? "bg-[#0058A3] text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {activeTab === "tagestour" && <Tagestour />}
        {activeTab === "planung" && <Planung />}
        {activeTab === "gesamt" && <Gesamtuebersicht />}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-6">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-gray-500 flex justify-between items-center">
          <span>© {new Date().getFullYear()} Möbel Gehlenborg GmbH</span>
          <a
            href="https://www.moebel-gehlenborg.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0058A3] transition"
          >
            moebel-gehlenborg.de
          </a>
        </div>
      </footer>
    </div>
  );
}
