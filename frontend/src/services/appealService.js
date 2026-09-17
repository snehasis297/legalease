import api from './api';

export const appealService = {
  validateToken: (token) => api.get(`/appeal/validate?token=${token}`),
  submitAppeal: (formData) => api.post('/appeal/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAllAppeals: (params = { page: 0, size: 10 }) => api.get('/admin/appeals', { params }),
  getAppeal: (id) => api.get(`/admin/appeals/${id}`),
  approveAppeal: (id) => api.post(`/admin/appeals/${id}/approve`),
  rejectAppeal: (id, data) => api.post(`/admin/appeals/${id}/reject`, data),
};

export default appealService;
