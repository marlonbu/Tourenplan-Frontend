const API_URL = import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  "Content-Type": "application/json",
});

export const api = {
  // Optionaler Login – gibt das API_TOKEN zurück
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Login fehlgeschlagen");
    return res.json();
  },

  // Fahrer
  listFahrer: async () => {
    const res = await fetch(`${API_URL}/fahrer`, { headers: { Authorization: authHeader().Authorization } });
    if (!res.ok) throw new Error("Fehler beim Laden der Fahrer");
    return res.json();
  },
  addFahrer: async (name) => {
    const res = await fetch(`${API_URL}/fahrer`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Fehler beim Hinzufügen");
    return res.json();
  },
  deleteFahrer: async (id) => {
    const res = await fetch(`${API_URL}/fahrer/${id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader().Authorization },
    });
    if (!res.ok) throw new Error("Fehler beim Löschen");
    return res.json();
  },

  // Planung
  getTour: async (fahrerId, datum) => {
    const res = await fetch(`${API_URL}/touren/${fahrerId}/${datum}`, {
      headers: { Authorization: authHeader().Authorization },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Tour");
    return res.json();
  },
  createTour: async (fahrer_id, datum) => {
    const res = await fetch(`${API_URL}/touren`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ fahrer_id, datum }),
    });
    if (!res.ok) throw new Error("Fehler beim Anlegen der Tour");
    return res.json();
  },

  listStoppsByTour: async (tourId) => {
    const res = await fetch(`${API_URL}/touren/${tourId}/stopps`, {
      headers: { Authorization: authHeader().Authorization },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Stopps");
    return res.json();
  },
  addStopp: async (tourId, payload) => {
    const res = await fetch(`${API_URL}/touren/${tourId}/stopps`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Fehler beim Hinzufügen des Stopps");
    return res.json();
  },
  updateStopp: async (id, payload) => {
    const res = await fetch(`${API_URL}/stopps/${id}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Fehler beim Aktualisieren des Stopps");
    return res.json();
  },
  deleteStopp: async (id) => {
    const res = await fetch(`${API_URL}/stopps/${id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader().Authorization },
    });
    if (!res.ok) throw new Error("Fehler beim Löschen des Stopps");
    return res.json();
  },
};
