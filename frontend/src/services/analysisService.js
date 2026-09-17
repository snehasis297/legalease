import api from './api';

export const analysisService = {
  triggerAnalysis: (documentId) => api.post(`/analysis/analyze/${documentId}`),
  getAnalysis: (documentId) => api.get(`/analysis/${documentId}`),
  getClauses: (documentId) => api.get(`/analysis/${documentId}/clauses`),
};
