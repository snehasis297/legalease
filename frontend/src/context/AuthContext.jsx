import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenHelper } from '../utils/tokenHelper';
import { authService } from '../services/authService';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('legalease_user') || sessionStorage.getItem('legalease_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Attempt token refresh on initial load if needed
  useEffect(() => {
    const initAuth = async () => {
      const hasToken = tokenHelper.hasAccessToken();
      const refreshToken = tokenHelper.getRefreshToken();
      
      if (!hasToken && refreshToken) {
        try {
          const res = await authService.refresh();
          const payload = res.data?.data || res.data;
          if (payload?.accessToken) {
            tokenHelper.setAccessToken(payload.accessToken);
            if (payload?.refreshToken) {
              tokenHelper.setRefreshToken(payload.refreshToken);
            }
            const userData = {
              id: payload.userId,
              email: payload.email,
              fullName: payload.fullName,
              role: payload.role,
              accountStatus: payload.accountStatus,
            };
            setUser(userData);
            localStorage.setItem('legalease_user', JSON.stringify(userData));
            sessionStorage.setItem('legalease_user', JSON.stringify(userData));
          }
        } catch (err) {
          tokenHelper.clearAccessToken();
          setUser(null);
          localStorage.removeItem('legalease_user');
          sessionStorage.removeItem('legalease_user');
        }
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const payload = res.data?.data || res.data;
    const { accessToken, refreshToken, userId, fullName, role, accountStatus } = payload;
    tokenHelper.setAccessToken(accessToken);
    if (refreshToken) {
      tokenHelper.setRefreshToken(refreshToken);
    }
    const userData = { id: userId, email, fullName, role, accountStatus };
    setUser(userData);
    try {
      localStorage.setItem('legalease_user', JSON.stringify(userData));
      sessionStorage.setItem('legalease_user', JSON.stringify(userData));
    } catch (e) {}
    return userData;
  };

  const adminLogin = async (email, password, totpCode) => {
    const res = await authService.adminLogin({ email, password, totpCode });
    const payload = res.data?.data || res.data;
    if (payload.requires2FA) {
      return { requires2FA: true };
    }
    const { accessToken, refreshToken, userId, fullName, role, accountStatus } = payload;
    tokenHelper.setAccessToken(accessToken);
    if (refreshToken) {
      tokenHelper.setRefreshToken(refreshToken);
    }
    const userData = { id: userId, email, fullName, role, accountStatus };
    setUser(userData);
    try {
      localStorage.setItem('legalease_user', JSON.stringify(userData));
      sessionStorage.setItem('legalease_user', JSON.stringify(userData));
    } catch (e) {}
    return userData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
    } finally {
      tokenHelper.clearAccessToken();
      setUser(null);
      try {
        localStorage.removeItem('legalease_user');
        sessionStorage.removeItem('legalease_user');
      } catch (e) {}
      window.location.href = '/login';
    }
  };

  const loginWithOtp = async (email, otp) => {
    const res = await authService.verifyLoginOtp({ email, otp });
    const payload = res.data?.data || res.data;
    const { accessToken, refreshToken, userId, fullName, role, accountStatus } = payload;
    tokenHelper.setAccessToken(accessToken);
    if (refreshToken) {
      tokenHelper.setRefreshToken(refreshToken);
    }
    const userData = { id: userId, email, fullName, role, accountStatus };
    setUser(userData);
    try {
      localStorage.setItem('legalease_user', JSON.stringify(userData));
      sessionStorage.setItem('legalease_user', JSON.stringify(userData));
    } catch (e) {}
    return userData;
  };

  const updateAccountStatus = (newStatus) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, accountStatus: newStatus };
      try {
        localStorage.setItem('legalease_user', JSON.stringify(updated));
        sessionStorage.setItem('legalease_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user && tokenHelper.hasAccessToken()),
        login,
        loginWithOtp,
        adminLogin,
        logout,
        updateAccountStatus,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
