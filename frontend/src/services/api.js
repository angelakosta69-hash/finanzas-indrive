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

const request = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return handleResponse(res);
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado. Intenta de nuevo.');
    }
    if (err.message === 'Sesión expirada') throw err;
    throw new Error('Error de conexión con el servidor');
  }
};

export const api = {
  auth: {
    login: async (email, password) => {
      return request(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    },
    register: async (data) => {
      return request(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
  },
  dashboard: {
    getResumen: async () => {
      return request(`${API_URL}/dashboard`, { headers: getHeaders() });
    },
    getDia: async (fecha) => {
      return request(`${API_URL}/dashboard/dia?fecha=${fecha}`, { headers: getHeaders() });
    },
    getHistorial: async () => {
      return request(`${API_URL}/dashboard/historial`, { headers: getHeaders() });
    }
  },
  ingresos: {
    listar: async (fechaInicio, fechaFin) => {
      let url = `${API_URL}/ingresos`;
      if (fechaInicio && fechaFin) {
        url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      }
      return request(url, { headers: getHeaders() });
    },
    crear: async (data) => {
      return request(`${API_URL}/ingresos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
    },
    eliminar: async (id) => {
      return request(`${API_URL}/ingresos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    }
  },
  gastos: {
    listar: async (fechaInicio, fechaFin) => {
      let url = `${API_URL}/gastos`;
      if (fechaInicio && fechaFin) {
        url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
      }
      return request(url, { headers: getHeaders() });
    },
    crear: async (data) => {
      return request(`${API_URL}/gastos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
    },
    eliminar: async (id) => {
      return request(`${API_URL}/gastos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    }
  },
  categorias: {
    listar: async () => {
      return request(`${API_URL}/categorias-gasto`, { headers: getHeaders() });
    }
  },
  config: {
    getPerfil: async () => {
      return request(`${API_URL}/config`, { headers: getHeaders() });
    },
    actualizarNombre: async (nombre) => {
      return request(`${API_URL}/config/nombre`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ nombre })
      });
    },
    actualizarTelefono: async (telefono) => {
      return request(`${API_URL}/config/telefono`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ telefono })
      });
    },
    cambiarPassword: async (passwordActual, passwordNueva) => {
      return request(`${API_URL}/config/password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ passwordActual, passwordNueva })
      });
    }
  }
};
