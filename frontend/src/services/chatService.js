import api from './api';
import { tokenHelper } from '../utils/tokenHelper';

export const chatService = {
  createSession: (documentId) => api.post(`/chat/session/${documentId}`),
  getSessions: () => api.get('/chat/sessions'),
  getHistory: (documentId) => api.get(`/chat/${documentId}/history`),
  getChatHistory: (documentId) => api.get(`/chat/${documentId}/history`),
  deleteSession: (id) => api.delete(`/chat/session/${id}`),

  // SSE Streaming helper via fetch
  streamMessage: async (documentId, message, onChunk, onError, onDone) => {
    try {
      const token = tokenHelper.getAccessToken();
      const response = await fetch(`/api/chat/${documentId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep last partial line

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') {
              if (onDone) onDone();
              return;
            } else if (data) {
              if (onChunk) onChunk(data);
            }
          }
        }
      }
      if (onDone) onDone();
    } catch (err) {
      if (onError) onError(err);
      else throw err;
    }
  },
};

export default chatService;
