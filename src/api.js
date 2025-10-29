const API_URL = import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const api = {
  // Fahrer
  listFahrer: async () => {
    const res = await fetch(`${API_URL}/fahrer`, { headers: authHeader() });
    if (!res.ok) throw new Error("Fehler beim Laden der Fahrer");
    return res.json();
  },
  addFahrer: async (name) => {
    const res = await fetch(`${API_URL}/fahrer`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Fehler beim Hinzufügen des Fahrers");
    return res.json();
  },
  deleteFahrer: async (id) => {
    const res = await fetch(`${API_URL}/fahrer/${id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader().Authorization },
    });
    if (!res.ok) throw new Error("Fehler beim Löschen des Fahrers");
    return res.json();
  },

  // Touren
  createTour: async (fahrer_id, datum) => {
    const res = await fetch(`${API_URL}/touren`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ fahrer_id, datum }),
    });
    if (!res.ok) throw new Error("Fehler beim Anlegen der Tour");
    return res.json();
  },
  getTour: async (fahrerId, datum) => {
    const res = await fetch(`${API_URL}/touren/${fahrerId}/${datum}`, {
      headers: { Authorization: authHeader().Authorization },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Tour");
    return res.json();
  },

  // Stopps
  addStopp: async (tour_id, payload) => {
    const res = await fetch(`${API_URL}/stopps/${tour_id}`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Fehler beim Hinzufügen des Stopps");
    return res.json();
  },
  deleteStopp: async (stopp_id) => {
    const res = await fetch(`${API_URL}/stopps/${stopp_id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader().Authorization },
    });
    if (!res.ok) throw new Error("Fehler beim Löschen des Stopps");
    return res.json();
  },
  updateStopp: async (stopp_id, payload) => {
    const res = await fetch(`${API_URL}/stopps/${stopp_id}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Fehler beim Bearbeiten des Stopps");
    return res.json();
  },
};
