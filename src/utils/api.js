import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const wineriesAPI = {
  getAll: (params = {}) =>
    api.get('/wineries', {
      params: { ...params, status: 'published' }
    }),
  getOne: (id) => api.get(`/wineries/${id}`),
};

export const winesAPI = {
  getAll: (params = {}) =>
    api.get('/wines', {
      params: { ...params, status: 'published' }
    }),
  getOne: (id) => api.get(`/wines/${id}`),
  getByWinery: (wineryId) =>
    api.get('/wines', {
      params: { winery: wineryId, status: 'published' }
    }),
};

export const vintagesAPI = {
  getAll: (params = {}) => api.get('/vintages', { params }),
  getOne: (id) => api.get(`/vintages/${id}`),
  getByWine: (wineId) => api.get('/vintages', { params: { wine: wineId } }),
};

export default api;
