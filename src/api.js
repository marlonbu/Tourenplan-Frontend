// src/api.js — sendet automatisch Authorization-Header
// JWT: "Bearer <eyJ...>", Legacy: "Gehlenborg" (ohne Bearer)

export const API_URL =
  import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

function makeAuthHeader() {
  const token = localStorage.getItem("token") || "";
  const headers = { "Content-Type": "application/json" };
  if (!token) return headers;

  // JWTs beginnen i. d. R. mit "eyJ"
  if (token.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    // Legacy-Token (z. B. "Gehlenborg") ohne Bearer
    headers.Authorization = token;
  }
  return headers;
}

async function handle(res, msg) {
  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {}
    throw new Error(detail ? `${msg}: ${detail}` : msg);
  }
  return res.json();
}

export const api = {
  // ---------- Fahrer ----------
  async listFahrer() {
    const res = await fetch(`${API_URL}/fahrer`, { headers: makeAuthHeader() });
    return handle(res, "Fehler beim Laden der Fahrer");
  },

  async addFahrer(name) {
    const res = await fetch(`${API_URL}/fahrer`, {
      method: "POST",
      headers: makeAuthHeader(),
      body: JSON.stringify({ name }),
    });
    return handle(res, "Fehler beim Hinzufügen des Fahrers");
  },

  async deleteFahrer(id) {
    const res = await fetch(`${API_URL}/fahrer/${id}`, {
      method: "DELETE",
      headers: makeAuthHeader(),
    });
    return handle(res, "Fehler beim Löschen des Fahrers");
  },

  // ---------- Touren ----------
  async createTour(fahrer_id, datum) {
    const res = await fetch(`${API_URL}/touren`, {
      method: "POST",
      headers: makeAuthHeader(),
      body: JSON.stringify({ fahrer_id, datum }),
    });
    return handle(res, "Fehler beim Anlegen der Tour");
  },

  async getTour(fahrer_id, datum) {
    const res = await fetch(`${API_URL}/touren/${fahrer_id}/${datum}`, {
      headers: makeAuthHeader(),
    });
    return handle(res, "Fehler beim Laden der Tour");
  },

  // ---------- Stopps ----------
  async createStopp(tour_id, stopp) {
    const res = await fetch(`${API_URL}/stopps/${tour_id}`, {
      method: "POST",
      headers: makeAuthHeader(),
      body: JSON.stringify(stopp),
    });
    return handle(res, "Fehler beim Hinzufügen des Stopps");
  },

  async deleteStopp(id) {
    const res = await fetch(`${API_URL}/stopps/${id}`, {
      method: "DELETE",
      headers: makeAuthHeader(),
    });
    return handle(res, "Fehler beim Löschen des Stopps");
  },

  // ---------- Foto Upload/Löschen ----------
  async uploadStoppFoto(stopp_id, file) {
    const form = new FormData();
    form.append("foto", file);
    const token = localStorage.getItem("token") || "";
    const headers =
      token && token.startsWith("eyJ")
        ? { Authorization: `Bearer ${token}` }
        : token
        ? { Authorization: token }
        : undefined;

    const res = await fetch(`${API_URL}/stopps/${stopp_id}/foto`, {
      method: "POST",
      headers, // kein Content-Type für FormData
      body: form,
    });
    return handle(res, "Fehler beim Foto-Upload");
  },

  async deleteStoppFoto(stopp_id) {
    const token = localStorage.getItem("token") || "";
    const headers =
      token && token.startsWith("eyJ")
        ? { Authorization: `Bearer ${token}` }
        : token
        ? { Authorization: token }
        : undefined;

    const res = await fetch(`${API_URL}/stopps/${stopp_id}/foto`, {
      method: "DELETE",
      headers,
    });
    return handle(res, "Fehler beim Foto-Löschen");
  },
};

export default api;
