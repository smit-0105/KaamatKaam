import api from './axios';

export const chatApi = {
  getOrCreateConversation: (participantId: string, rideId?: string) =>
    api.post('/chat/conversations', { participantId, rideId }),

  getMyConversations: () => api.get('/chat/conversations'),

  getMessages: (conversationId: string, page?: number) =>
    api.get(`/chat/conversations/${conversationId}/messages`, { params: { page } }),

  sendMessage: (conversationId: string, content: string) =>
    api.post(`/chat/conversations/${conversationId}/messages`, { content }),
};
