const API_URL = import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

export const api = {
  // 🔐 Login
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Login fehlgeschlagen");
    return res.json();
  },

  // 👥 Fahrer abrufen
  listFahrer: async () => {
    const res = await fetch(`${API_URL}/fahrer`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Fahrer");
    return res.json();
  },

  // 🚚 Tour eines Fahrers laden
  getTour: async (fahrerId, datum) => {
    const res = await fetch(`${API_URL}/touren/${fahrerId}/${datum}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Tour");
    return res.json();
  },

  // 🧭 Wochenübersicht laden
  getWoche: async () => {
    const res = await fetch(`${API_URL}/touren-woche`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Wochenübersicht");
    return res.json();
  },

  // 🗑️ Datenbank zurücksetzen
  reset: async () => {
    const res = await fetch(`${API_URL}/reset`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Fehler beim Zurücksetzen");
    return res.json();
  },

  // 📸 Foto-Upload
  uploadFoto: async (stoppId, file) => {
    const formData = new FormData();
    formData.append("foto", file);

    const res = await fetch(`${API_URL}/upload/${stoppId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });

    if (!res.ok) throw new Error("Fehler beim Upload");
    return res.json();
  },

  // ➕ Fahrer hinzufügen
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

  // 🗑️ Fahrer löschen
  deleteFahrer: async (id) => {
    const res = await fetch(`${API_URL}/fahrer/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!res.ok) throw new Error("Fehler beim Löschen");
    return res.json();
  },
};
