import apiClient from '../client';
import { API_CONFIG } from '../config';

export const messagesService = {
  async getConversations() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES.CONVERSATIONS);
    return response.data.conversations || response.data;
  },

  async getMessages(conversationId: string) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES.LIST, {
      params: { conversationId },
    });
    return response.data.messages || response.data;
  },

  async sendMessage(receiverId: string, content: string) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.MESSAGES.SEND, {
      receiverId,
      content,
    });
    return response.data;
  },
};