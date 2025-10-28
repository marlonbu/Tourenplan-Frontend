// src/api.js
const API_URL = import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

// Hilfsfunktionen
const getToken = () => localStorage.getItem("token") || "";

const authHeader = (json = true) => {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
};

// Zentrale Fetch-Hilfe (wirft bei !ok)
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return null;
}

export const api = {
  // ===== Fahrer =====
  listFahrer: async () =>
    request("/fahrer", {
      headers: authHeader(false), // nur Auth, kein JSON nötig
    }),

  addFahrer: async (name) =>
    request("/fahrer", {
      method: "POST",
      headers: authHeader(true), // JSON-Header WICHTIG
      body: JSON.stringify({ name }),
    }),

  deleteFahrer: async (id) =>
    request(`/fahrer/${id}`, {
      method: "DELETE",
      headers: authHeader(false),
    }),

  // ===== Touren / Stopps (für Planung / Tagestour) =====
  createTour: async (fahrerId, datum) =>
    request("/touren", {
      method: "POST",
      headers: authHeader(true),
      body: JSON.stringify({ fahrerId, datum }),
    }),

  getTour: async (fahrerId, datum) =>
    request(`/touren/${fahrerId}/${datum}`, {
      headers: authHeader(false),
    }),

  addStopp: async (tourId, stopp) =>
    request("/stopps", {
      method: "POST",
      headers: authHeader(true),
      body: JSON.stringify({ tourId, ...stopp }),
    }),

  deleteStopp: async (id) =>
    request(`/stopps/${id}`, {
      method: "DELETE",
      headers: authHeader(false),
    }),
};
