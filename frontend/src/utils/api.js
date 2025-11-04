const API_BASE = 'https://lab-test-tracker-3.onrender.com/api';

export async function register({ name, email, password, role }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
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
export async function getPatients(token) {
  const res = await fetch(`${API_BASE}/patients`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}