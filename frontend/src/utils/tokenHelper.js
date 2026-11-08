// Storage keys for resilient session persistence across reloads and tab navigations
const ACCESS_TOKEN_KEY = 'legalease_access_token';
const REFRESH_TOKEN_KEY = 'legalease_refresh_token';

let inMemoryAccessToken = null;
let inMemoryRefreshToken = null;

export const tokenHelper = {
  getAccessToken: () => {
    if (inMemoryAccessToken) return inMemoryAccessToken;
    try {
      const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
      if (stored) {
        inMemoryAccessToken = stored;
        return stored;
      }
    } catch (e) {}
    return null;
  },
  setAccessToken: (token) => {
    inMemoryAccessToken = token;
    try {
      if (token) {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch (e) {}
  },
  getRefreshToken: () => {
    if (inMemoryRefreshToken) return inMemoryRefreshToken;
    try {
      const stored = sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
      if (stored) {
        inMemoryRefreshToken = stored;
        return stored;
      }
    } catch (e) {}
    return null;
  },
  setRefreshToken: (token) => {
    inMemoryRefreshToken = token;
    try {
      if (token) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch (e) {}
  },
  clearAccessToken: () => {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    try {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (e) {}
  },
  hasAccessToken: () => Boolean(tokenHelper.getAccessToken()),
  isTokenExpired: (token = tokenHelper.getAccessToken()) => {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      // exp is in seconds; buffer by 5 seconds
      return Date.now() >= (payload.exp - 5) * 1000;
    } catch (e) {
      return false;
    }
  },
};

export default tokenHelper;
