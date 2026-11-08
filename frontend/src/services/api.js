import axios from 'axios';
import { tokenHelper } from '../utils/tokenHelper';

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
    const refreshToken = tokenHelper.getRefreshToken();
    if (refreshToken) {
      config.headers['X-Refresh-Token'] = refreshToken;
    }
    // Client device fingerprint
    const fingerprint = window.__LEGAL_EASE_FINGERPRINT || 'browser-session-default';
    config.headers['X-Device-Fingerprint'] = fingerprint;

    // Critical fix: Allow browser to set boundary for multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
                           originalRequest?.url?.includes('/auth/register') ||
                           originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      const isExpired = tokenHelper.isTokenExpired();
      const isSessionCheck = originalRequest?.url?.includes('/auth/me') || originalRequest?.url?.includes('/auth/validate');

      // If the access token is mathematically still valid and this is not a session check endpoint,
      // do not wipe the user's session or force a redirect - let the page handle the resource error.
      if (!isExpired && !isSessionCheck) {
        if (error.response?.data?.message) {
          error.message = error.response.data.message;
        }
        return Promise.reject(error);
      }

      const refreshToken = tokenHelper.getRefreshToken();
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post('/api/auth/refresh', null, {
            headers: { 'X-Refresh-Token': refreshToken },
          });
          const newToken = res.data?.data?.accessToken;
          if (newToken) {
            tokenHelper.setAccessToken(newToken);
            processQueue(null, newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          // Only redirect if token is truly expired
          if (tokenHelper.isTokenExpired()) {
            tokenHelper.clearAccessToken();
            const path = window.location.pathname;
            if (path !== '/' && path !== '/login' && path !== '/register' && !path.startsWith('/appeal')) {
              window.location.href = path.startsWith('/admin') ? '/admin/login' : '/login';
            }
          }
        } finally {
          isRefreshing = false;
        }
      } else if (isSessionCheck && isExpired) {
        tokenHelper.clearAccessToken();
        const path = window.location.pathname;
        if (path !== '/' && path !== '/login' && path !== '/register' && !path.startsWith('/appeal')) {
          window.location.href = path.startsWith('/admin') ? '/admin/login' : '/login';
        }
      }
    }

    // Attach backend message to error.message for cleaner error handling across all views
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export default api;
