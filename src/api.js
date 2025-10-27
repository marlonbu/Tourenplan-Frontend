const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login fehlgeschlagen");
  const data = await res.json();
  if (data.token) localStorage.setItem("token", data.token);
  return data;
}

async function me() {
  const res = await fetch(`${API_BASE}/me`, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error("Me fehlgeschlagen");
  return res.json();
}

async function listFahrer() {
  const res = await fetch(`${API_BASE}/fahrer`, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error("Fahrerabruf fehlgeschlagen");
  return res.json();
}

async function getTourForDay(fahrerId, datum) {
  const res = await fetch(`${API_BASE}/touren/${fahrerId}/${datum}`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("Tour konnte nicht geladen werden");
  return res.json();
}

async function createTour(fahrer_id, datum) {
  const res = await fetch(`${API_BASE}/touren`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ fahrer_id, datum }),
  });
  if (!res.ok) throw new Error("Tour konnte nicht angelegt werden");
  return res.json();
}

async function addStopp(tour_id, s) {
  const res = await fetch(`${API_BASE}/stopps`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ tour_id, ...s }),
  });
  if (!res.ok) throw new Error("Stopp konnte nicht angelegt werden");
  return res.json();
}

async function deleteStopp(stoppId) {
  const res = await fetch(`${API_BASE}/stopps/${stoppId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("Stopp konnte nicht gelöscht werden");
  return res.json();
}

async function uploadFoto(stoppId, file) {
  const fd = new FormData();
  fd.append("foto", file);
  const res = await fetch(`${API_BASE}/stopps/${stoppId}/foto`, {
    method: "POST",
    headers: { ...authHeader() },
    body: fd,
  });
  if (!res.ok) throw new Error("Foto-Upload fehlgeschlagen");
  return res.json();
}

async function getTourenWoche(params) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/touren-woche?${q}`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("Gesamtübersicht fehlgeschlagen");
  return res.json();
}

export const api = {
  login,
  me,
  listFahrer,
  getTourForDay,
  createTour,
  addStopp,
  deleteStopp,
  uploadFoto,
  getTourenWoche,
};
