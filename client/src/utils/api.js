import axios from 'axios';
import { API_URL } from '../config/api';

export { getFileUrl } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
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

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  getUsers: () => api.get('/auth/users')
};

// Wineries API
export const wineriesAPI = {
  getAll: (params) => api.get('/wineries', { params }),
  getOne: (id) => api.get(`/wineries/${id}`),
  create: (data) => api.post('/wineries', data),
  update: (id, data) => api.put(`/wineries/${id}`, data),
  delete: (id) => api.delete(`/wineries/${id}`)
};

// Wines API
export const winesAPI = {
  getAll: (params) => api.get('/wines', { params }),
  getOne: (id) => api.get(`/wines/${id}`),
  create: (data) => api.post('/wines', data),
  update: (id, data) => api.put(`/wines/${id}`, data),
  delete: (id) => api.delete(`/wines/${id}`),
  addAward: (id, award) => api.post(`/wines/${id}/awards`, award),
  deleteAward: (id, awardId) => api.delete(`/wines/${id}/awards/${awardId}`)
};

// Vintages API
export const vintagesAPI = {
  getAll: (params) => api.get('/vintages', { params }),
  getOne: (id) => api.get(`/vintages/${id}`),
  create: (data) => api.post('/vintages', data),
  update: (id, data) => api.put(`/vintages/${id}`, data),
  delete: (id) => api.delete(`/vintages/${id}`),
  updateAsset: (id, assetType, data) => api.put(`/vintages/${id}/assets/${assetType}`, data),
  deleteAsset: (id, assetType) => api.delete(`/vintages/${id}/assets/${assetType}`)
};

// Upload API
export const uploadAPI = {
  single: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  multiple: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  delete: (filename) => api.delete(`/upload/${filename}`)
};

// AI API
export const aiAPI = {
  generateWineImage: (data) => api.post('/ai/generate-wine-image', data),
  removeWineImage: (wineId) => api.delete(`/ai/wine-image/${wineId}`)
};

export default api;
