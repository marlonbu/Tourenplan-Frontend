const API_URL = import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

// 🔑 Token aus localStorage
function getToken() {
  return localStorage.getItem("token");
}

// 🧠 Hilfsfunktion für Requests
async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Fehler bei der Anfrage");
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// 🧩 API-Objekt mit allen Endpunkten
export const api = {
  // --- Auth ---
  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Login fehlgeschlagen");
    const data = await res.json();
    localStorage.setItem("token", data.token);
    return data;
  },

  async me() {
    return request("/me");
  },

  // --- Fahrer ---
  async listFahrer() {
    return request("/fahrer");
  },

  // --- Touren ---
  async getTourByFahrerUndDatum(fahrerId, datum) {
    return request(`/touren/${fahrerId}/${datum}`);
  },

  async createTour(body) {
    return request("/touren", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // --- Stopps ---
  async createStopp(body) {
    return request("/stopps", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async deleteStopp(id) {
    return request(`/stopps/${id}`, { method: "DELETE" });
  },

  async uploadFoto(stoppId, file) {
    const formData = new FormData();
    formData.append("foto", file);
    const res = await fetch(`${API_URL}/stopps/${stoppId}/foto`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Fehler beim Foto-Upload");
    return res.json();
  },

  // --- Wochen-/Gesamtansicht ---
  async getTourenWoche(params) {
    const query = new URLSearchParams(params).toString();
    return request(`/touren-woche?${query}`);
  },

  // --- Dashboard (optional) ---
  async getTourenHeute() {
    return request("/touren-woche"); // Beispielhafter Re-Use
  },

  async getStopps() {
    // Holt alle Stopps (z. B. für Dashboard-Zählung)
    return request("/stopps");
  },
};
// Fahrer hinzufügen
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

// Fahrer löschen
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

