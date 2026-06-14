export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3100';

export async function fetchJson(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    credentials: 'include',
    ...options
  });

  if (!response.ok) {
    let detail = `estado HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) {
        detail = body.error;
      }
    } catch {
      // ignore JSON parse errors
    }
    const error = new Error(`La petición a ${url} ha fallado: ${detail}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function login(email, password) {
  return fetchJson('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

export async function logout() {
  return fetchJson('/auth/logout', { method: 'POST' });
}
