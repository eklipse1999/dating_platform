import apiClient from '../client';
import { API_CONFIG } from '../config';
import { User } from '@/lib/types';

export interface DiscoverFilters {
  ageMin?: number;
  ageMax?: number;
  location?: string;
  distance?: number;
  tier?: string;
  verified?: boolean;
  gender?: 'male' | 'female';
  denomination?: string;
  category?: 'all' | 'recent' | 'popular' | 'verified' | 'premium' | 'nearby';
  limit?: number;
  offset?: number;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  career?: string;
  age?: number;
  phone?: string;
  location?: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  denomination?: string;
  interests?: string[];
  faithJourney?: string;
  values?: string[];
  church?: {
    name: string;
    branch?: string;
    city?: string;
    country?: string;
  };
}

export const usersService = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await apiClient.put(API_CONFIG.ENDPOINTS.USERS.UPDATE, data);
      
      // Update local storage
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  /**
   * Upload profile photo
   */
  async uploadPhoto(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PROFILE.UPLOAD_IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.url || response.data.photoUrl;
    } catch (error: any) {
      console.error('Upload photo error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to upload photo');
    }
  },

  /**
   * Discover users based on filters
   */
  async discoverUsers(filters?: DiscoverFilters): Promise<User[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.DISCOVER, {
        params: filters,
      });
      return response.data.users || response.data || [];
    } catch (error: any) {
      console.error('Discover users error:', error.response?.data || error.message);
      // Return empty array instead of throwing to prevent UI breaks
      return [];
    }
  },

  /**
   * Search users by query
   */
  async searchUsers(query: string, filters?: DiscoverFilters): Promise<User[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.SEARCH, {
        params: { q: query, ...filters },
      });
      return response.data.users || response.data || [];
    } catch (error: any) {
      console.error('Search users error:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.USERS.GET_BY_ID}/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get user by ID error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  /**
   * Update user location
   */
  async updateLocation(latitude: number, longitude: number): Promise<void> {
    try {
      await apiClient.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_LOCATION, {
        lat: latitude,
        lng: longitude,
      });
    } catch (error: any) {
      console.error('Update location error:', error.response?.data || error.message);
    }
  },
};

export default usersService;