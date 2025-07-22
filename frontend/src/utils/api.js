const API_BASE = 'http://localhost:5000/api';

export async function register({ name, email, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// Example for getting patients (protected route)
export async function getPatients(token) {
  const res = await fetch(`${API_BASE}/patients`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}