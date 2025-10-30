import React from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";

import Planung from "./pages/Planung";
import Tagestour from "./pages/Tagestour";

const Layout = ({ children }) => {
  const location = useLocation();
  const active = (path) =>
    location.pathname.startsWith(path)
      ? "bg-white text-[#0058A3]"
      : "text-white/90 hover:text-white";

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0058A3] text-white flex flex-col">
        <div className="p-4 text-lg font-semibold border-b border-white/20">
          Tourenplan
        </div>

        <nav className="flex-1 p-3 space-y-2">
          <Link
            to="/planung"
            className={`block px-4 py-2 rounded-md ${active("/planung")}`}
          >
            Planung
          </Link>
          <Link
            to="/tagestour"
            className={`block px-4 py-2 rounded-md ${active("/tagestour")}`}
          >
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
  const token = localStorage.getItem("token");

  // Kein Token -> Loginseite
  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow w-full max-w-sm">
          <h1 className="text-xl font-semibold text-[#0058A3] mb-4">Login</h1>
          <p className="text-sm text-gray-600 mb-4">
            Entweder direkt ein JWT einfügen <b>(API‑Token)</b> oder mit
            Benutzer <b>Gehlenborg</b> und Passwort <b>Orga1023/</b> anmelden.
          </p>
          <LoginForm />
        </div>
      </div>
    );
  }

  // Mit Token -> App
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/planung" replace />} />
        <Route path="/planung" element={<Planung />} />
        <Route path="/tagestour" element={<Tagestour />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </Layout>
  );
}

function LoginForm() {
  const [username, setUsername] = React.useState("Gehlenborg");
  const [password, setPassword] = React.useState("Orga1023/");
  const [token, setToken] = React.useState("");
  const [msg, setMsg] = React.useState("");

  const API_BASE =
    import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setMsg("");

    try {
      // 1) Manuell eingefügtes Token akzeptieren
      if (token.trim()) {
        localStorage.setItem("token", token.trim());
        window.location.reload();
        return;
      }

      // 2) Login gegen Backend
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Login fehlgeschlagen");
      const data = await res.json();
      if (!data.token) throw new Error("Kein Token erhalten");

      localStorage.setItem("token", data.token); // -> "eyJ..."
      window.location.reload();
    } catch (err) {
      console.error("[Login] Fehler:", err);
      setMsg("❌ Login fehlgeschlagen");
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleLogin(e);
  };

  return (
    <form onSubmit={handleLogin} onKeyDown={onKeyDown} className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">API‑Token (optional)</label>
        <input
          className="mt-1 border rounded-md px-3 py-2 w-full"
          placeholder="JWT hier einfügen"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">Benutzername</label>
          <input
            className="mt-1 border rounded-md px-3 py-2 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Passwort</label>
          <input
            type="password"
            className="mt-1 border rounded-md px-3 py-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        onClick={handleLogin}
        className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition w-full"
      >
        Anmelden
      </button>

      {msg && <div className="text-sm text-red-600">{msg}</div>}
    </form>
  );
}
