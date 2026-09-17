import axios from 'axios';
import { tokenHelper } from '../utils/tokenHelper';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = tokenHelper.getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Client device fingerprint
    const fingerprint = window.__LEGAL_EASE_FINGERPRINT || 'browser-session-default';
    config.headers['X-Device-Fingerprint'] = fingerprint;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (error.response?.status === 401) {
      tokenHelper.clearAccessToken();
      // Only redirect if not already on public routes
      const path = window.location.pathname;
      if (path !== '/' && path !== '/login' && path !== '/register' && !path.startsWith('/appeal')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || { message });
  }
);

export default api;
