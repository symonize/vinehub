import { optimizeCloudinaryUrl } from '../utils/imageOptimization';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const API_URL = `${API_BASE_URL}/api`;

// Helper to get file URL — returns Cloudinary URLs as-is, falls back to server-relative path
export const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}/${path}`;
};

// Helper to get an optimized Cloudinary image URL with transforms (f_auto, q_auto, width)
export const getOptimizedImageUrl = (path, options = {}) => {
  const url = getFileUrl(path);
  if (!url) return null;
  return optimizeCloudinaryUrl(url, options);
};
