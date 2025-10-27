import React, { useState } from "react";
import Tagestour from "./pages/Tagestour";
import Planung from "./pages/Planung";
import Gesamtuebersicht from "./pages/Gesamtuebersicht";

export default function App() {
  const [tab, setTab] = useState("Tagestour");

  const renderContent = () => {
    switch (tab) {
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
    <div className="container">
      {/* Header */}
      <header className="navbar">
        <h1>🚛 Gehlenborg Tourenplan</h1>

        <nav className="nav-tabs">
          {["Tagestour", "Planung", "Gesamtübersicht"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`nav-tab ${tab === t ? "active" : ""}`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      {/* Inhalt */}
      <main>{renderContent()}</main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 mt-12">
        © {new Date().getFullYear()} Hans Gehlenborg GmbH – Tourenplan-System
      </footer>
    </div>
  );
}
