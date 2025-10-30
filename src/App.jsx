import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Planung from "./pages/Planung";
import Tagestour from "./pages/Tagestour";
import Uebersicht from "./pages/Uebersicht";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="text-xl font-semibold text-[#0058A3]">Tourenplan</div>
          <nav className="flex gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-md ${isActive ? "bg-[#0058A3] text-white" : "hover:bg-gray-100"}`
              }
            >
              Planung
            </NavLink>
            <NavLink
              to="/tagestour"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md ${isActive ? "bg-[#0058A3] text-white" : "hover:bg-gray-100"}`
              }
            >
              Tagestour
            </NavLink>
            <NavLink
              to="/gesamtuebersicht"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md ${isActive ? "bg-[#0058A3] text-white" : "hover:bg-gray-100"}`
              }
            >
              Gesamtübersicht
            </NavLink>
          </nav>
          <div className="ml-auto" />
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function LogoutButton() {
  function doLogout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
  const hasToken = !!localStorage.getItem("token");
  return hasToken ? (
    <button
      onClick={doLogout}
      className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
    >
      Logout
    </button>
  ) : null;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Planung />} />
        <Route path="/tagestour" element={<Tagestour />} />
        <Route path="/gesamtuebersicht" element={<Uebersicht />} />
      </Routes>
    </Layout>
  );
}
