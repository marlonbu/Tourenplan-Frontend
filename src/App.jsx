import React from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import Planung from "./pages/Planung";
import Tagestour from "./pages/Tagestour";
import Uebersicht from "./pages/Uebersicht";
import Tourverwaltung from "./pages/Tourverwaltung"; // wichtig, bleibt unverändert
import Login from "./pages/Login";

function Layout({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const hasToken = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="text-xl font-semibold text-[#0058A3]">Tourenplan</div>

          {hasToken && (
            <nav className="flex gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-[#0058A3] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`
                }
              >
                Planung
              </NavLink>
              <NavLink
                to="/tagestour"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-[#0058A3] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`
                }
              >
                Tagestour
              </NavLink>
              <NavLink
                to="/gesamtuebersicht"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-[#0058A3] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`
                }
              >
                Gesamtübersicht
              </NavLink>
              <NavLink
                to="/tourverwaltung"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-[#0058A3] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`
                }
              >
                Tourverwaltung
              </NavLink>
            </nav>
          )}

          <div className="ml-auto" />

          {hasToken && (
            <button
              onClick={handleLogout}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

export default function App() {
  const hasToken = !!localStorage.getItem("token");

  return (
    <Layout>
      <Routes>
        {!hasToken ? (
          <Route path="*" element={<Login />} />
        ) : (
          <>
            <Route path="/" element={<Planung />} />
            <Route path="/tagestour" element={<Tagestour />} />
            <Route path="/gesamtuebersicht" element={<Uebersicht />} />
            <Route path="/tourverwaltung" element={<Tourverwaltung />} />
            <Route path="/login" element={<Login />} />
          </>
        )}
      </Routes>
    </Layout>
  );
}
