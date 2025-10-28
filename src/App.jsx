import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";

// Lazy-Laden verhindert, dass defekte Komponenten alles blockieren
const Planung = React.lazy(() => import("./pages/Planung"));
const Tagestour = React.lazy(() => import("./pages/Tagestour"));

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
          <button onClick={logout} className="underline opacity-90">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

// Minimal-Login
function LoginForm() {
  const [token, setToken] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!token.trim()) return setMsg("❌ Kein Token eingegeben");
    localStorage.setItem("token", token.trim());
    window.location.reload();
  };

  return (
    <form onSubmit={handleLogin} className="space-y-3">
      <input
        className="border rounded-md px-3 py-2 w-full"
        placeholder="API-Token eingeben"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button className="bg-[#0058A3] text-white px-4 py-2 rounded-md w-full">
        Anmelden
      </button>
      {msg && <div className="text-sm text-red-600">{msg}</div>}
    </form>
  );
}

export default function App() {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow w-full max-w-sm">
          <h1 className="text-xl font-semibold text-[#0058A3] mb-4">Login</h1>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div className="p-6 text-center">⏳ Lädt Seite…</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/planung" replace />} />
            <Route path="/planung" element={<Planung />} />
            <Route path="/tagestour" element={<Tagestour />} />
            <Route path="*" element={<div className="p-6">404 – Nicht gefunden</div>} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
