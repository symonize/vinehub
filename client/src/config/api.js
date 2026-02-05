// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const API_URL = `${API_BASE_URL}/api`;

// Helper to get file URL
export const getFileUrl = (path) => {
  if (!path) return null;
  return `${API_BASE_URL}/${path}`;
};
