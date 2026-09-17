import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenHelper } from '../utils/tokenHelper';
import { authService } from '../services/authService';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attempt token refresh on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authService.refresh();
        if (res.data?.accessToken) {
          tokenHelper.setAccessToken(res.data.accessToken);
          setUser({
            id: res.data.userId,
            email: res.data.email,
            fullName: res.data.fullName,
            role: res.data.role,
            accountStatus: res.data.accountStatus,
          });
        }
      } catch (err) {
        tokenHelper.clearAccessToken();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { accessToken, userId, fullName, role, accountStatus } = res.data;
    tokenHelper.setAccessToken(accessToken);
    const userData = { id: userId, email, fullName, role, accountStatus };
    setUser(userData);
    return userData;
  };

  const adminLogin = async (email, password, totpCode) => {
    const res = await authService.adminLogin({ email, password, totpCode });
    if (res.data.requires2FA) {
      return { requires2FA: true };
    }
    const { accessToken, userId, fullName, role, accountStatus } = res.data;
    tokenHelper.setAccessToken(accessToken);
    const userData = { id: userId, email, fullName, role, accountStatus };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
    } finally {
      tokenHelper.clearAccessToken();
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateAccountStatus = (newStatus) => {
    setUser((prev) => (prev ? { ...prev, accountStatus: newStatus } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user && tokenHelper.hasAccessToken()),
        login,
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
