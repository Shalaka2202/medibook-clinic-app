import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
};

export const doctorsAPI = {
  list: (params) => API.get('/doctors', { params }),
  specializations: () => API.get('/doctors/specializations'),
  get: (id) => API.get(`/doctors/${id}`),
  slots: (id, date) => API.get(`/doctors/${id}/slots`, { params: { date } }),
};

export const appointmentsAPI = {
  list: () => API.get('/appointments'),
  create: (data) => API.post('/appointments', data),
  get: (id) => API.get(`/appointments/${id}`),
  update: (id, data) => API.patch(`/appointments/${id}`, data),
  delete: (id) => API.delete(`/appointments/${id}`),
};

export const adminAPI = {
  stats: () => API.get('/admin/stats'),
  addDoctor: (data) => API.post('/admin/doctors', data),
  removeDoctor: (userId) => API.delete(`/admin/doctors/${userId}`),
};

export default API;
