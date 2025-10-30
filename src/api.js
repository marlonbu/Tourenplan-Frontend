// src/api.js — Zentrale API, setzt automatisch Authorization-Header
// JWT: "Bearer <eyJ...>", Legacy (falls noch erlaubt): "Gehlenborg"

export const API_URL =
  import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

function makeAuthHeader() {
  const token = localStorage.getItem("token") || "";
  const headers = { "Content-Type": "application/json" };
  if (!token) return headers;

  if (token.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    headers.Authorization = token; // Legacy
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

  // ---------- Foto ----------
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

  // ---------- Fahrer-Anmerkung ----------
  async updateStoppAnmerkung(id, anmerkung_fahrer) {
    const res = await fetch(`${API_URL}/stopps/${id}/anmerkung`, {
      method: "PATCH",
      headers: makeAuthHeader(),
      body: JSON.stringify({ anmerkung_fahrer }),
    });
    return handle(res, "Fehler beim Speichern der Anmerkung");
  },

  // ---------- Bestehende Touren-Übersicht (optional weiter nutzbar) ----------
  async getUebersicht({ fahrer_id, datum, kw, kunde } = {}) {
    const params = new URLSearchParams();
    if (fahrer_id) params.set("fahrer_id", fahrer_id);
    if (datum) params.set("datum", datum);
    if (kw) params.set("kw", kw);
    if (kunde) params.set("kunde", kunde);
    const url = `${API_URL}/touren-uebersicht${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, { headers: makeAuthHeader() });
    return handle(res, "Fehler beim Laden der Übersicht");
  },

  // ---------- NEU: Stopps-Flat-View ----------
  async getStoppsUebersicht({ fahrer_id, date_from, date_to, kw, kunde } = {}) {
    const params = new URLSearchParams();
    if (fahrer_id) params.set("fahrer_id", fahrer_id);
    if (date_from) params.set("date_from", date_from);
    if (date_to) params.set("date_to", date_to);
    if (kw) params.set("kw", kw); // Format: YYYY-Www
    if (kunde) params.set("kunde", kunde);

    const url = `${API_URL}/stopps-uebersicht${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, { headers: makeAuthHeader() });
    return handle(res, "Fehler beim Laden der Stopps-Übersicht");
  },
};

export default api;
