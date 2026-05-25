import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const petService = {
  getAll: () => api.get('/pets'),
  create: (data) => api.post('/pets', data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`)
};

export const appointmentService = {
  getAll: () => api.get('/appointments'),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`)
};

export const slotService = {
  getAll: () => api.get('/slots'),
  create: (data) => api.post('/slots', data)
};

export default api;