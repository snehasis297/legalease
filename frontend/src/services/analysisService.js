import api from './api';

export const analysisService = {
  triggerAnalysis: (documentId) => api.post(`/analysis/${documentId}/trigger`),
  getAnalysis: (documentId) => api.get(`/analysis/document/${documentId}`),
  getAnalysisByDocument: (documentId) => api.get(`/analysis/document/${documentId}`),
  getClauses: (documentId) => api.get(`/analysis/${documentId}/clauses`),
};

export default analysisService;
