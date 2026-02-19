import apiClient from '../client';
import { API_CONFIG } from '../config';

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  matchedAt: Date;
  user?: any;
}

export interface LikeResponse {
  matched: boolean;
  matchId?: string;
  message?: string;
}

export const matchesService = {
  /**
   * Get all matches (mutual matches)
   */
  async getMatches(): Promise<Match[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MATCHES.LIST);
      return response.data.matches || response.data || [];
    } catch (error: any) {
      console.error('Get matches error:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Get liked users who liked you back
   */
  async getLikeMatches(): Promise<any[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.LIKES.MATCHES);
      return response.data.matches || response.data || [];
    } catch (error: any) {
      console.error('Get like matches error:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Like a user
   */
  async likeUser(userId: string): Promise<LikeResponse> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.LIKES.LIKE, {
        userId,
      });
      return response.data;
    } catch (error: any) {
      console.error('Like user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to like user');
    }
  },

  /**
   * Unlike a user
   */
  async unlikeUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(API_CONFIG.ENDPOINTS.LIKES.UNLIKE, {
        data: { userId },
      });
    } catch (error: any) {
      console.error('Unlike user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to unlike user');
    }
  },

  /**
   * Block a user
   */
  async blockUser(userId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.BLOCKS.CREATE, {
        blockedUserId: userId,
        reason,
      });
    } catch (error: any) {
      console.error('Block user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to block user');
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(API_CONFIG.ENDPOINTS.BLOCKS.REMOVE, {
        data: { blockedUserId: userId },
      });
    } catch (error: any) {
      console.error('Unblock user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to unblock user');
    }
  },

  /**
   * Get blocked users list
   */
  async getBlockedUsers(userId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BLOCKS.LIST}/${userId}`);
      return response.data.blockedUsers || response.data || [];
    } catch (error: any) {
      console.error('Get blocked users error:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Check if two users can interact (not blocked)
   */
  async canInteract(userId: string, otherUserId: string): Promise<boolean> {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.BLOCKS.CAN_INTERACT}/${userId}/${otherUserId}`
      );
      return response.data.canInteract || false;
    } catch (error: any) {
      console.error('Can interact error:', error.response?.data || error.message);
      return false;
    }
  },
};

export default matchesService;