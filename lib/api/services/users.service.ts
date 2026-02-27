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
  age?: number;
  bio?: string;
  career?: string;
  church_branch?: string;
  church_name?: string;
  denomination?: string;
  gender?: string;
  interests?: string[];
  key?: string;
  looking_for?: string;
  profile_image?: string;
}

export const usersService = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.ME);
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
      formData.append('file', file); // Backend might expect 'image' instead of 'photo'
      
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PROFILE.UPLOAD_IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.url || response.data.photoUrl || response.data.imageUrl;
    } catch (error: any) {
      console.error('Upload photo error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to upload photo');
    }
  },

  /**
   * Discover users (Get all users via Admin endpoint)
   */
  async discoverUsers(filters?: DiscoverFilters): Promise<User[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.BY_ADMIN, {
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
   * Get user by ID (profile)
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PROFILE.GET_BY_ID}/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get user by ID error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  /**
   * Update user location
   */
  async updateLocation(latitude: number, longitude: number, city?: string, country?: string): Promise<void> {
    try {
      await apiClient.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_LOCATION, {
        latitude,
        longitude,
        city,
        country,
      });
    } catch (error: any) {
      console.error('Update location error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update location');
    }
  },
};

export default usersService;