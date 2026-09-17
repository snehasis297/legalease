import api from './api';

export const adminService = {
  getUsers: (page = 0, size = 10) => api.get(`/admin/users?page=${page}&size=${size}`),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, status, reason) => api.put(`/admin/users/${id}/status`, { status, reason }),
  getVerificationQueue: (page = 0, size = 10) => api.get(`/admin/verification-queue?page=${page}&size=${size}`),
  getLawyerDocuments: (userId) => api.get(`/admin/verification/${userId}/documents`),
  approveLawyer: (userId) => api.put(`/admin/verification/${userId}/approve`),
  rejectLawyer: (userId, reason) => api.put(`/admin/verification/${userId}/reject`, { reason }),
  getAllDocuments: (page = 0, size = 10) => api.get(`/admin/documents?page=${page}&size=${size}`),
  getAuditLogs: (page = 0, size = 20) => api.get(`/admin/audit-logs?page=${page}&size=${size}`),
  getSuspiciousActivities: (page = 0, size = 10) => api.get(`/admin/suspicious-activities?page=${page}&size=${size}`),
  resolveSuspiciousActivity: (id) => api.put(`/admin/suspicious-activities/${id}/resolve`),
  getIpBlacklist: (page = 0, size = 10) => api.get(`/admin/ip-blacklist?page=${page}&size=${size}`),
  blockIp: (data) => api.post('/admin/ip-blacklist', data),
  unblockIp: (id) => api.delete(`/admin/ip-blacklist/${id}`),
  getAppeals: (page = 0, size = 10) => api.get(`/admin/appeals?page=${page}&size=${size}`),
  getAppeal: (id) => api.get(`/admin/appeals/${id}`),
  approveAppeal: (id) => api.put(`/admin/appeals/${id}/approve`),
  rejectAppeal: (id, reason) => api.put(`/admin/appeals/${id}/reject`, { reason }),
  getStats: () => api.get('/admin/stats'),
};
