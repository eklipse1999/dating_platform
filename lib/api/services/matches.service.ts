import apiClient from '../client';
import { API_CONFIG } from '../config';

export const matchesService = {
  async getMatches() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.MATCHES.LIST);
    return response.data.matches || response.data;
  },

  async likeUser(userId: string) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.MATCHES.LIKE, {
      userId,
    });
    return response.data;
  },
};