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
  
  getVerificationQueue: (params) => api.get('/admin/verifications', { params }),
  getVerification: (id) => api.get(`/admin/verifications/${id}`),
  approveVerification: (id) => api.post(`/admin/verifications/${id}/approve`),
  rejectVerification: (id, data) => api.post(`/admin/verifications/${id}/reject`, data),
  getLawyerDocuments: (userId) => api.get(`/admin/verification/${userId}/documents`),
  approveLawyer: (userId) => api.put(`/admin/verification/${userId}/approve`),
  rejectLawyer: (userId, reason) => api.put(`/admin/verification/${userId}/reject`, { reason }),
  
  getAllDocuments: (params = { page: 0, size: 10 }) => api.get('/admin/documents', { params }),
  getAuditLogs: (params = { page: 0, size: 20 }) => api.get('/admin/audit-logs', { params }),
  getSuspiciousActivities: (params = { page: 0, size: 10 }) => api.get('/admin/suspicious', { params }),
  resolveSuspiciousActivity: (id) => api.put(`/admin/suspicious/${id}/resolve`),
  
  getIpBlacklist: (params = { page: 0, size: 10 }) => api.get('/admin/blacklist', { params }),
  addBlacklistIp: (data) => api.post('/admin/blacklist', data),
  removeBlacklistIp: (id) => api.delete(`/admin/blacklist/${id}`),
  blockIp: (data) => api.post('/admin/blacklist', data),
  unblockIp: (id) => api.delete(`/admin/blacklist/${id}`),
  
  getAppeals: (params = { page: 0, size: 10 }) => api.get('/admin/appeals', { params }),
  getAllAppeals: (params = { page: 0, size: 10 }) => api.get('/admin/appeals', { params }),
  getAppeal: (id) => api.get(`/admin/appeals/${id}`),
  approveAppeal: (id) => api.post(`/admin/appeals/${id}/approve`),
  rejectAppeal: (id, data) => api.post(`/admin/appeals/${id}/reject`, data),
  
  getStats: () => api.get('/admin/dashboard/stats'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

export default adminService;
