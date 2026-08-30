const BASE = '/api';

async function parseRes(res) {
  const data = await res.json();
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
