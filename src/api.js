// ==========================================================
// API-Modul – Tourenplan Frontend
// ==========================================================

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

// Token aus localStorage holen
function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ==========================================================
//  LOGIN
// ==========================================================
async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login fehlgeschlagen");
  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data;
}

// ==========================================================
//  FAHRER
// ==========================================================
async function listFahrer() {
  const res = await fetch(`${API_BASE}/fahrer`, {
    headers: {
      ...authHeader(),
    },
  });
  if (!res.ok) throw new Error("Fahrerabruf fehlgeschlagen");
  return res.json();
}

// ==========================================================
//  TOUREN – Tagesdaten
// ==========================================================
async function getTourForDay(fahrerId, datum) {
  const res = await fetch(`${API_BASE}/touren/${fahrerId}/${datum}`, {
    headers: {
      ...authHeader(),
    },
  });
  if (!res.ok) throw new Error("Tour konnte nicht geladen werden");
  return res.json();
}

// ==========================================================
//  TOUREN – Wochen- oder Gesamtübersicht
// ==========================================================
async function getTourenWoche(query = {}) {
  const params = new URLSearchParams(query).toString();
  const res = await fetch(`${API_BASE}/touren-woche?${params}`, {
    headers: {
      ...authHeader(),
    },
  });
  if (!res.ok) throw new Error("Tourenübersicht konnte nicht geladen werden");
  return res.json();
}

// ==========================================================
//  STOPPS – Anlegen
// ==========================================================
async function addStopp(stopp) {
  const res = await fetch(`${API_BASE}/stopps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(stopp),
  });
  if (!res.ok) throw new Error("Stopp konnte nicht angelegt werden");
  return res.json();
}

// ==========================================================
//  STOPPS – Löschen
// ==========================================================
async function deleteStopp(stoppId) {
  const res = await fetch(`${API_BASE}/stopps/${stoppId}`, {
    method: "DELETE",
    headers: {
      ...authHeader(),
    },
  });
  if (!res.ok) throw new Error("Stopp konnte nicht gelöscht werden");
  return res.json();
}

// ==========================================================
//  FOTO-UPLOAD
// ==========================================================
async function uploadFoto(stoppId, file) {
  const formData = new FormData();
  formData.append("foto", file);
  formData.append("stopp_id", stoppId);

  const res = await fetch(`${API_BASE}/upload-foto`, {
    method: "POST",
    headers: {
      ...authHeader(),
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Foto-Upload fehlgeschlagen");
  return res.json();
}

// ==========================================================
//  EXPORT
// ==========================================================
export const api = {
  login,
  listFahrer,
  getTourForDay,
  getTourenWoche,
  addStopp,
  deleteStopp,
  uploadFoto,
};
