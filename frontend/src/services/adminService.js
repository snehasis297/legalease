import api from './api';

export const adminService = {
  getUsers: (params = { page: 0, size: 10 }) => api.get('/admin/users', { params }),
  getAllUsers: (params = { page: 0, size: 10 }) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, status, reason) => api.put(`/admin/users/${id}/status`, { status, reason }),
  suspendUser: (id, data) => api.post(`/admin/users/${id}/suspend`, data),
  disableUser: (id, data) => api.post(`/admin/users/${id}/disable`, data),
  unlockUser: (id) => api.post(`/admin/users/${id}/unlock`),
  
  getVerificationQueue: (params) => api.get('/admin/verification-queue', { params }),
  getVerification: (id) => api.get(`/admin/verification/${id}`),
  approveVerification: (id) => api.put(`/admin/verification/${id}/approve`),
  rejectVerification: (id, data) => api.put(`/admin/verification/${id}/reject`, data),
  getLawyerDocuments: (userId) => api.get(`/admin/verification/${userId}/documents`),
  approveLawyer: (userId) => api.put(`/admin/verification/${userId}/approve`),
  rejectLawyer: (userId, reason) => api.put(`/admin/verification/${userId}/reject`, { reason }),
  
  getAllDocuments: (params = { page: 0, size: 10 }) => api.get('/admin/documents', { params }),
  getAuditLogs: (params = { page: 0, size: 20 }) => api.get('/admin/audit-logs', { params }),
  getSuspiciousActivities: (params = { page: 0, size: 10 }) => api.get('/admin/suspicious-activities', { params }),
  resolveSuspiciousActivity: (id) => api.put(`/admin/suspicious-activities/${id}/resolve`),
  
  getIpBlacklist: (params = { page: 0, size: 10 }) => api.get('/admin/ip-blacklist', { params }),
  addBlacklistIp: (data) => api.post('/admin/ip-blacklist', data),
  removeBlacklistIp: (id) => api.delete(`/admin/ip-blacklist/${id}`),
  blockIp: (data) => api.post('/admin/ip-blacklist', data),
  unblockIp: (id) => api.delete(`/admin/ip-blacklist/${id}`),
  
  getAppeals: (params = { page: 0, size: 10 }) => api.get('/admin/appeals', { params }),
  getAllAppeals: (params = { page: 0, size: 10 }) => api.get('/admin/appeals', { params }),
  getAppeal: (id) => api.get(`/admin/appeals/${id}`),
  approveAppeal: (id) => api.put(`/admin/appeals/${id}/approve`),
  rejectAppeal: (id, data) => api.put(`/admin/appeals/${id}/reject`, data),
  
  getStats: () => api.get('/admin/stats'),
  getDashboardStats: () => api.get('/admin/stats'),
};

export default adminService;
