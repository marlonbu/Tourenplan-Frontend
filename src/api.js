const API_URL = import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

export const api = {
  // Login
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
    const res = await fetch(`${API_URL}/fahrer`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Fahrer");
    return res.json();
  },
  addFahrer: async (name) => {
    const res = await fetch(`${API_URL}/fahrer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Fehler beim Hinzufügen");
    return res.json();
  },
  deleteFahrer: async (id) => {
    const res = await fetch(`${API_URL}/fahrer/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Löschen");
    return res.json();
  },

  // Planung / Tour
  getTour: async (fahrerId, datum) => {
    const res = await fetch(`${API_URL}/touren/${fahrerId}/${datum}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Tour");
    return res.json();
  },
  createTour: async (fahrerId, datum) => {
    const res = await fetch(`${API_URL}/touren`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ fahrerId, datum }),
    });
    if (!res.ok) throw new Error("Fehler beim Anlegen der Tour");
    return res.json();
  },
  listStoppsByTour: async (tourId) => {
    const res = await fetch(`${API_URL}/touren/${tourId}/stopps`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Stopps");
    return res.json();
  },
  addStopp: async (tourId, payload) => {
    const res = await fetch(`${API_URL}/touren/${tourId}/stopps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Fehler beim Hinzufügen des Stopps");
    return res.json();
  },
  updateStopp: async (id, payload) => {
    const res = await fetch(`${API_URL}/stopps/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Fehler beim Aktualisieren des Stopps");
    return res.json();
  },
  deleteStopp: async (id) => {
    const res = await fetch(`${API_URL}/stopps/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Löschen des Stopps");
    return res.json();
  },

  // Gesamtübersicht
  getGesamtTours: async ({ fahrerId, from, to, kunde } = {}) => {
    const params = new URLSearchParams();
    if (fahrerId) params.set("fahrerId", fahrerId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (kunde) params.set("kunde", kunde);
    const res = await fetch(`${API_URL}/touren-gesamt?` + params.toString(), {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Gesamtübersicht");
    return res.json();
  },

  // (alt) Wochenübersicht / Reset
  getWoche: async () => {
    const res = await fetch(`${API_URL}/touren-woche`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Wochenübersicht");
    return res.json();
  },
  reset: async () => {
    const res = await fetch(`${API_URL}/reset`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Zurücksetzen");
    return res.json();
  },
};
