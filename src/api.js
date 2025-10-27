// src/api.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
      ...authHeaders(),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
  }
  // /reset antwortet {ok:true}, DELETE evtl. ohne body
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const api = {
  // Auth
  async login(username, password) {
    const data = await req('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data?.token) localStorage.setItem('token', data.token);
    return data;
  },

  // Stammdaten
  listFahrer() {
    return req('/fahrer', { method: 'GET' });
  },

  // Tagestour lesen
  getTourForDay(fahrerId, datum) {
    return req(`/touren/${encodeURIComponent(fahrerId)}/${encodeURIComponent(datum)}`, { method: 'GET' });
  },

  // Touren (CRUD + Filter)
  createTour(payload) {
    return req('/touren', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateTour(id, payload) {
    return req(`/touren/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteTour(id) {
    return req(`/touren/${id}`, { method: 'DELETE' });
  },
  listTouren(params = {}) {
    const q = new URLSearchParams(params).toString();
    return req(`/touren${q ? `?${q}` : ''}`, { method: 'GET' });
  },

  // Stopps (CRUD)
  listStopps(params = {}) {
    const q = new URLSearchParams(params).toString();
    return req(`/stopps${q ? `?${q}` : ''}`, { method: 'GET' });
  },
  createStopp(payload) {
    return req('/stopps', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateStopp(id, payload) {
    return req(`/stopps/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteStopp(id) {
    return req(`/stopps/${id}`, { method: 'DELETE' });
  },

  // Gesamtübersicht
  uebersicht(params = {}) {
    const q = new URLSearchParams(params).toString();
    return req(`/uebersicht${q ? `?${q}` : ''}`, { method: 'GET' });
  },

  // Utilities
  reset() {
    return req('/reset', { method: 'POST' });
  },
};
