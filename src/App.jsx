import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";

import Planung from "./pages/Planung";
import Tagestour from "./pages/Tagestour";

const Layout = ({ children }) => {
  const location = useLocation();
  const active = (path) =>
    location.pathname === path
      ? "bg-white text-[#0058A3]"
      : "text-white hover:bg-blue-700/60";

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
          <div className="font-semibold text-xl">Tourenplan</div>
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

  // Kein Token -> Loginseite anzeigen
  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow w-full max-w-sm">
          <h1 className="text-xl font-semibold text-[#0058A3] mb-4">Login</h1>
          <p className="text-sm text-gray-600 mb-4">
            Trage dein API-Token ein (oder nutze Benutzer{" "}
            <b>Gehlenborg</b> / Passwort <b>Orga1023/</b>).
          </p>
          <LoginForm />
        </div>
      </div>
    );
  }

  // Wenn Token vorhanden -> App laden
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
      // 1) Manuelles Token erlaubt
      if (token.trim()) {
        console.log("[Login] Manuelles Token verwendet");
        localStorage.setItem("token", token.trim());
        window.location.reload();
        return;
      }

      // 2) Login gegen Backend
      console.log("[Login] POST /login...");
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        console.warn("[Login] Backend antwortete nicht OK:", res.status);
        throw new Error("Login fehlgeschlagen");
      }
      const data = await res.json();
      if (!data.token) {
        console.warn("[Login] Keine token-Property in Antwort");
        throw new Error("Kein Token erhalten");
      }

      console.log("[Login] Token erhalten, speichere in localStorage");
      localStorage.setItem("token", data.token);
      window.location.reload();
    } catch (err) {
      console.error("[Login] Fehler:", err);
      setMsg("❌ Login fehlgeschlagen");
    }
  };

  // Enter-Taste triggert Submit
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <form onSubmit={handleLogin} onKeyDown={onKeyDown} className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">API-Token (Alternative)</label>
        <input
          className="mt-1 border rounded-md px-3 py-2 w-full"
          placeholder="API-Token hier einfügen (optional)"
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
        className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800 transition w-full pointer-events-auto"
      >
        Anmelden
      </button>

      {msg && <div className="text-sm text-red-600">{msg}</div>}
    </form>
  );
}
