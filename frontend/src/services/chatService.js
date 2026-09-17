import api from './api';
import { tokenHelper } from '../utils/tokenHelper';

export const chatService = {
  createSession: (documentId) => api.post(`/chat/session/${documentId}`),
  getSessions: () => api.get('/chat/sessions'),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
  deleteSession: (id) => api.delete(`/chat/session/${id}`),

  // SSE Streaming helper via fetch
  streamMessage: async (sessionId, message, onToken, onComplete, onError) => {
    try {
      const token = tokenHelper.getAccessToken();
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ sessionId, message }),
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
              if (onComplete) onComplete();
              return;
            } else if (data) {
              if (onToken) onToken(data);
            }
          }
        }
      }
      if (onComplete) onComplete();
    } catch (err) {
      if (onError) onError(err);
    }
  },
};
