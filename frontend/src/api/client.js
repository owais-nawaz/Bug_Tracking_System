const BASE = '/api';

async function parseRes(res) {
  const text = await res.text();
  if (!text) throw new Error('No response from server — make sure the backend is running on port 3000.');
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('Invalid server response — the Vite proxy may not be active. Restart the dev server.'); }
  if (!data.success) throw new Error(data.errors ? data.errors.join(' ') : 'Error');
  return data;
}

export const authApi = {
  login: (creds) => fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds)
  }).then(parseRes),

  signup: (data) => fetch(`${BASE}/auth/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(parseRes),
};
