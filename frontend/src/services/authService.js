import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  verifyPhone: (data) => api.post('/auth/verify-phone', data),
  sendPhoneOtp: (data) => api.post('/auth/send-phone-otp', data),
  submitKyc: (data) => api.post('/auth/submit-kyc', data),
  verifyIdentity: (formData) => api.post('/auth/verify-identity', formData),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  changePassword: (data) => api.post('/auth/change-password', data),
  getTwoFactorSetup: () => api.get('/auth/2fa/setup'),
  enableTwoFactor: (code) => api.post('/auth/2fa/enable', { code }),
  sendLoginOtp: (email) => api.post('/auth/login-otp', { email }),
  verifyLoginOtp: (data) => api.post('/auth/verify-login-otp', data),
};

export default authService;
