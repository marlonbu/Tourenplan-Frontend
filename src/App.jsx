import React from "react";
import { NavLink, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Planung from "./pages/Planung";
import Tagestour from "./pages/Tagestour";
import Uebersicht from "./pages/Uebersicht";
import Tourverwaltung from "./pages/Tourverwaltung";
import Login from "./pages/Login";

function useToken() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token && token.length > 10 ? token : null;
}

function ProtectedRoute({ children }) {
  const token = useToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function Layout({ children }) {
  const token = useToken();
  const location = useLocation();
  const onLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header nicht auf der Login-Seite */}
      {!onLoginPage && (
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
              <NavLink
                to="/tourverwaltung"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md ${isActive ? "bg-[#0058A3] text-white" : "hover:bg-gray-100"}`
                }
              >
                Tourverwaltung
              </NavLink>
            </nav>
            <div className="ml-auto" />
            {token ? <LogoutButton /> : null}
          </div>
        </header>
      )}
      <main className={onLoginPage ? "" : "max-w-6xl mx-auto px-4 py-6"}>{children}</main>
    </div>
  );
}

function LogoutButton() {
  function doLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  return (
    <button
      onClick={doLogout}
      className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
    >
      Logout
    </button>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Login ist die einzige ungeschützte Route */}
        <Route path="/login" element={<Login />} />

        {/* Geschützte Bereiche */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Planung />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tagestour"
          element={
            <ProtectedRoute>
              <Tagestour />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gesamtuebersicht"
          element={
            <ProtectedRoute>
              <Uebersicht />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tourverwaltung"
          element={
            <ProtectedRoute>
              <Tourverwaltung />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
