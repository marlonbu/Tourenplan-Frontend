import React, { useState } from "react";
import { api } from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await api.login(username, password);
      if (res.token) {
        window.location.href = "/";
      }
    } catch {
      setError("❌ Login fehlgeschlagen – bitte Zugangsdaten prüfen");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6fa]">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo192.png"
            alt="Gehlenborg"
            className="mx-auto w-20 mb-4"
          />
          <h1 className="text-2xl font-semibold text-[#0058A3]">
            Möbel Gehlenborg
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Tourenplan – Anmeldung
          </p>
        </div>

        {/* Formular */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benutzername
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0058A3] outline-none"
              placeholder="z. B. Gehlenborg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#0058A3] outline-none"
              placeholder="z. B. Orga1023/"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mt-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#0058A3] text-white font-semibold py-2 rounded-md hover:bg-blue-800 transition"
          >
            Anmelden
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 mt-8">
          © {new Date().getFullYear()} Möbel Gehlenborg GmbH
        </p>
      </div>
    </div>
  );
}
