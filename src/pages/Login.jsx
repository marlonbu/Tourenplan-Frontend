import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(username, password);
      navigate("/");
    } catch {
      setError("❌ Benutzername oder Passwort ist falsch.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#0058A3] text-white text-3xl font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-md">
              G
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0058A3]">
            Gehlenborg Tourenplan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bitte melde dich mit deinen Zugangsdaten an
          </p>
        </div>

        {/* Login-Formular */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Benutzername
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0058A3]"
              placeholder="z. B. Gehlenborg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0058A3]"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0058A3] text-white py-2 rounded-md font-semibold hover:bg-blue-800 transition disabled:opacity-60"
          >
            {loading ? "Wird geprüft..." : "Anmelden"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} Hans Gehlenborg GmbH
        </p>
      </div>
    </div>
  );
}
