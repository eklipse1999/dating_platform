import apiClient from '../client';
import { API_CONFIG } from '../config';

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  matchedAt: Date;
  user?: any;
}

// Exact response shape from GET /like and POST /like
export interface LikeRecord {
  id: string;
  liked_id: string;
  liker_id: string;
  created_at: string;
}

export interface LikeResponse {
  id?: string;
  liked_id?: string;
  liker_id?: string;
  created_at?: string;
  matched?: boolean;
  message?: string;
}

const silent = (status?: number) => [401, 404, 405].includes(status ?? 0);

export const matchesService = {

  // ─── Likes ───────────────────────────────────────────────

  // GET /like  — no params, returns array of likes received by authenticated user
  // Response: [{ created_at, id, liked_id, liker_id }]
  async getLikes(): Promise<LikeRecord[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.LIKES.LIKE);
      // Backend may return array directly or wrapped in { likes: [] }
      return Array.isArray(response.data) ? response.data : (response.data.likes || []);
    } catch (error: any) {
      if (!silent(error.response?.status)) console.error('Get likes error:', error.response?.data || error.message);
      return [];
    }
  },

  // GET /like/matches  — returns mutual matches for authenticated user (uses Bearer token, no body needed)
  async getMatches(currentUserId?: string): Promise<Match[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.LIKES.MATCHES);
      return response.data.matches || response.data || [];
    } catch (error: any) {
      if (!silent(error.response?.status)) console.error('Get matches error:', error.response?.data || error.message);
      return [];
    }
  },

  // Alias used by matches page
  async getLikeMatches(currentUserId?: string): Promise<any[]> {
    return matchesService.getMatches(currentUserId);
  },

  // POST /like  — body: { liked_id: uuid }  → 201 { created_at, id, liked_id, liker_id }
  async likeUser(likedId: string): Promise<LikeResponse> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.LIKES.LIKE, {
        liked_id: likedId,
      });
      return response.data;
    } catch (error: any) {
      if (!silent(error.response?.status)) console.error('Like user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to like user');
    }
  },

  // DELETE /like  — body: { liked_id: uuid } (same field name as POST /like)
  async unlikeUser(likedId: string): Promise<void> {
    try {
      await apiClient.delete(API_CONFIG.ENDPOINTS.LIKES.UNLIKE, { data: { liked_id: likedId } });
    } catch (error: any) {
      if (!silent(error.response?.status)) console.error('Unlike user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to unlike user');
    }
  },

  // ─── Blocks ──────────────────────────────────────────────

  // POST /block/create  — body: { blocker_id, blocked_id }
  async blockUser(currentUserId: string, blockedUserId: string): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.BLOCKS.CREATE, {
        blocker_id: currentUserId,
        blocked_id: blockedUserId,
      });
    } catch (error: any) {
      if (!silent(error.response?.status)) console.error('Block user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to block user');
    }
  },

  // POST /block/remove  — body: { blocker_id, blocked_id }  (POST not DELETE!)
  async unblockUser(currentUserId: string, blockedUserId: string): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.BLOCKS.REMOVE, {
        blocker_id: currentUserId,
        blocked_id: blockedUserId,
      });
    } catch (error: any) {
      if (!silent(error.response?.status)) console.error('Unblock user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to unblock user');
    }
  },

  // GET /block/list/{user_id}  — get all users blocked by user_id
  async getBlockedUsers(userId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.BLOCKS.LIST}/${userId}`);
      return response.data.blockedUsers || response.data || [];
    } catch (error: any) {
      if (!silent(error.response?.status)) console.error('Get blocked users error:', error.response?.data || error.message);
      return [];
    }
  },

  // GET /block/can-interact/{user_a}/{user_b}  — returns false if either blocked the other
  async canInteract(userA: string, userB: string): Promise<boolean> {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.BLOCKS.CAN_INTERACT}/${userA}/${userB}`
      );
      // Response shape: { additionalProp1: {} } — check for canInteract or just truthy
      return response.data?.canInteract ?? response.data?.result ?? true;
    } catch (error: any) {
      if (!silent(error.response?.status)) console.error('Can interact error:', error.response?.data || error.message);
      return true; // Default to allowing interaction if check fails
    }
  },
};

export default matchesService;