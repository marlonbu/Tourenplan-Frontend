// src/api.js — Zentrale API mit stabilem JWT-Login, Token-Speicherung und Authorization-Header

export const API_URL =
  import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

// ---------- Hilfsfunktionen ----------
function makeAuthHeader() {
  const token = localStorage.getItem("token") || "";
  const headers = { "Content-Type": "application/json" };

  // 🔒 Token wird nur gesetzt, wenn vorhanden
  if (token) {
    headers.Authorization = `Bearer ${token}`;
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

// ---------- API ----------
export const api = {
  // ---------- Login ----------
  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error("Login fehlgeschlagen");

    const data = await res.json();

    if (!data.token) throw new Error("Kein Token erhalten");

    // ✅ Token speichern
    localStorage.setItem("token", data.token);

    return data;
  },

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
  async updateStopp(id, data) {
    const res = await fetch(`${API_URL}/stopps/${id}`, {
      method: "PATCH",
      headers: makeAuthHeader(),
      body: JSON.stringify(data),
    });
    return handle(res, "Fehler beim Aktualisieren des Stopps");
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
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const res = await fetch(`${API_URL}/stopps/${stopp_id}/foto`, {
      method: "POST",
      headers,
      body: form,
    });
    return handle(res, "Fehler beim Foto-Upload");
  },
  async deleteStoppFoto(stopp_id) {
    const token = localStorage.getItem("token") || "";
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const res = await fetch(`${API_URL}/stopps/${stopp_id}/foto`, {
      method: "DELETE",
      headers,
    });
    return handle(res, "Fehler beim Foto-Löschen");
  },

  // ---------- Anmerkung Fahrer ----------
  async updateStoppAnmerkung(id, anmerkung_fahrer) {
    const res = await fetch(`${API_URL}/stopps/${id}/anmerkung`, {
      method: "PATCH",
      headers: makeAuthHeader(),
      body: JSON.stringify({ anmerkung_fahrer }),
    });
    return handle(res, "Fehler beim Speichern der Anmerkung");
  },

  // ---------- Admin / Übersicht ----------
  async getTourenAdmin({ fahrer_id, date_from, date_to, kw, kunde } = {}) {
    const params = new URLSearchParams();
    if (fahrer_id) params.set("fahrer_id", fahrer_id);
    if (date_from) params.set("date_from", date_from);
    if (date_to) params.set("date_to", date_to);
    if (kw) params.set("kw", kw);
    if (kunde) params.set("kunde", kunde);

    const url = `${API_URL}/touren-admin${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const res = await fetch(url, { headers: makeAuthHeader() });
    return handle(res, "Fehler beim Laden der Touren");
  },

  async getStoppsByTour(tour_id) {
    const res = await fetch(`${API_URL}/touren/${tour_id}/stopps`, {
      headers: makeAuthHeader(),
    });
    return handle(res, "Fehler beim Laden der Stopps");
  },

  async updateTour(id, data) {
    const res = await fetch(`${API_URL}/touren/${id}`, {
      method: "PATCH",
      headers: makeAuthHeader(),
      body: JSON.stringify(data),
    });
    return handle(res, "Fehler beim Aktualisieren der Tour");
  },

  async deleteTour(id) {
    const res = await fetch(`${API_URL}/touren/${id}`, {
      method: "DELETE",
      headers: makeAuthHeader(),
    });
    return handle(res, "Fehler beim Löschen der Tour");
  },
};

export default api;
