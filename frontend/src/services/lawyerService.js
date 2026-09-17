import api from './api';

export const lawyerService = {
  submitKyc: (formData) => api.post('/lawyer/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getKycStatus: () => api.get('/lawyer/kyc/status'),
  getPendingReviews: (params = { page: 0, size: 20 }) => api.get('/lawyer/reviews/pending', { params }),
  submitReview: (documentId, data) => api.post(`/lawyer/reviews/${documentId}`, data),
};

export default lawyerService;
