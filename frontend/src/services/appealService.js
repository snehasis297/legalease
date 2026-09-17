import api from './api';

export const appealService = {
  validateToken: (token) => api.get(`/appeal/validate?token=${token}`),
  submitAppeal: (formData) => api.post('/appeal/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
