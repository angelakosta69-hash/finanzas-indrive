const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Error ${res.status}`);
  }
  return data;
};

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },
    register: async (data) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },
  dashboard: {
    getResumen: async () => {
      const res = await fetch(`${API_URL}/dashboard`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getDia: async (fecha) => {
      const res = await fetch(`${API_URL}/dashboard/dia?fecha=${fecha}`, { headers: getHeaders() });
      return handleResponse(res);
    },
    getHistorial: async () => {
      const res = await fetch(`${API_URL}/dashboard/historial`, { headers: getHeaders() });
      return handleResponse(res);
    }
  },
  ingresos: {
    listar: async (fechaInicio, fechaFin) => {
      let url = `${API_URL}/ingresos`;
      if (fechaInicio && fechaFin) {
        url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      }
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },
    crear: async (data) => {
      const res = await fetch(`${API_URL}/ingresos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    eliminar: async (id) => {
      const res = await fetch(`${API_URL}/ingresos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },
  gastos: {
    listar: async (fechaInicio, fechaFin) => {
      let url = `${API_URL}/gastos`;
      if (fechaInicio && fechaFin) {
        url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      }
      const res = await fetch(url, { headers: getHeaders() });
      return handleResponse(res);
    },
    crear: async (data) => {
      const res = await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    eliminar: async (id) => {
      const res = await fetch(`${API_URL}/gastos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },
  categorias: {
    listar: async () => {
      const res = await fetch(`${API_URL}/categorias-gasto`, { headers: getHeaders() });
      return handleResponse(res);
    }
  }
};
