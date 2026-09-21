const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('mc_token');

   console.log(API_URL);
   console.log(path);
   console.log(options);
   



  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    const err = new Error(data?.error?.message || 'Error de red');
    err.code = data?.error?.code;
    throw err;
  }
  return data.data;
}

export const api = {
  registro: (payload) => request('/auth/registro', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  catalogo: () => request('/catalogo'),
  ejecutar: (payload) => request('/ejecutar', { method: 'POST', body: JSON.stringify(payload) }),
};
