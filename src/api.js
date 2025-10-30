// Zentrale API-Utility: sendet automatisch Authorization: Bearer <token>
// Export: sowohl named Functions als auch Default-Objekt (max. Kompatibilität)

export const API_URL =
  import.meta.env.VITE_API_URL || "https://tourenplan.onrender.com";

export const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ---------- Fahrer ----------
export async function listFahrer() {
  const res = await fetch(`${API_URL}/fahrer`, { headers: authHeader() });
  if (!res.ok) throw new Error("Fehler beim Laden der Fahrer");
  return res.json();
}

export async function addFahrer(name) {
  const res = await fetch(`${API_URL}/fahrer`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Fehler beim Hinzufügen des Fahrers");
  return res.json();
}

export async function deleteFahrer(id) {
  const res = await fetch(`${API_URL}/fahrer/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Fehler beim Löschen des Fahrers");
  return res.json();
}

// ---------- Touren ----------
export async function createTour(fahrer_id, datum) {
  const res = await fetch(`${API_URL}/touren`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ fahrer_id, datum }),
  });
  if (!res.ok) throw new Error("Fehler beim Anlegen der Tour");
  return res.json();
}

export async function getTour(fahrer_id, datum) {
  const res = await fetch(`${API_URL}/touren/${fahrer_id}/${datum}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Fehler beim Laden der Tour");
  return res.json();
}

// ---------- Stopps ----------
export async function createStopp(tour_id, stopp) {
  const res = await fetch(`${API_URL}/stopps/${tour_id}`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(stopp),
  });
  if (!res.ok) throw new Error("Fehler beim Hinzufügen des Stopps");
  return res.json();
}

export async function deleteStopp(id) {
  const res = await fetch(`${API_URL}/stopps/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Fehler beim Löschen des Stopps");
  return res.json();
}

// ---------- Fotos ----------
export async function uploadStoppFoto(stopp_id, file) {
  const form = new FormData();
  form.append("foto", file);
  const res = await fetch(`${API_URL}/stopps/${stopp_id}/foto`, {
    method: "POST",
    headers: { Authorization: authHeader().Authorization }, // kein Content-Type setzen!
    body: form,
  });
  if (!res.ok) throw new Error("Fehler beim Foto-Upload");
  return res.json();
}

export async function deleteStoppFoto(stopp_id) {
  const res = await fetch(`${API_URL}/stopps/${stopp_id}/foto`, {
    method: "DELETE",
    headers: { Authorization: authHeader().Authorization },
  });
  if (!res.ok) throw new Error("Fehler beim Foto-Löschen");
  return res.json();
}

// Default-Objekt (falls die Seite `import api from './api'` nutzt)
const api = {
  listFahrer,
  addFahrer,
  deleteFahrer,
  createTour,
  getTour,
  createStopp,
  deleteStopp,
  uploadStoppFoto,
  deleteStoppFoto,
};

export default api;
