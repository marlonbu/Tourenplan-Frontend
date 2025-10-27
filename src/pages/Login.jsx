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
      setError("Login fehlgeschlagen");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-[#0058A3] mb-6 text-center">
          Gehlenborg Tourenplan
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Benutzername</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-[#0058A3]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-[#0058A3]"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
