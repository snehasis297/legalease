import api from './api';

export const documentService = {
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },
  uploadDocument: (formData) => api.post('/documents/upload', formData),
  getDocuments: (page = 0, size = 10) => api.get(`/documents?page=${page}&size=${size}`),
  getMyDocuments: (params = { page: 0, size: 10 }) => api.get('/documents', { params }),
  getDocument: (id) => api.get(`/documents/${id}`),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  downloadDocument: async (id, fileName = 'contract.pdf') => {
    try {
      const res = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      return res;
    } catch (err) {
      console.error('Failed to download document:', err);
      throw err;
    }
  },
  downloadUrl: (id) => `/api/documents/${id}/download`,
};

export default documentService;
