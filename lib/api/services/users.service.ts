import apiClient from '../client';
import { API_CONFIG } from '../config';
import { User } from '@/lib/types';

export interface DiscoverFilters {
  ageMin?: number;
  ageMax?: number;
  tier?: string;
  category?: 'all' | 'recent' | 'popular' | 'verified' | 'premium' | 'nearby';
  limit?: number;
  offset?: number;
}

// GET /profile/{id} response schema — flat snake_case from backend
export interface ProfileResponse {
  age: number;
  bio: string;
  career: string;
  church_branch: string;
  church_name: string;
  created_at: string;
  denomination: string;
  gender: string;
  id: string;
  interests: string[];
  key: string;          // faith journey / faith statement
  looking_for: string;
  profile_image: string;
  user_id: string;
  // Additional fields that may be returned
  first_name?: string;
  last_name?: string;
  user_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
}

// PUT /update/user — exact body fields from Swagger (image confirmed):
// age, bio, career, church_branch, church_name, denomination, gender,
// interests[], key, looking_for, profile_image
// Note: first_name, last_name, city, country, phone are NOT in this endpoint
export interface UpdateProfileData {
  age?: number;
  bio?: string;
  career?: string;
  church_branch?: string;
  church_name?: string;
  denomination?: string;
  gender?: string;
  interests?: string[];
  key?: string;           // maps to faith journey / faith statement
  looking_for?: string;
  profile_image?: string;
}

const silent = (status?: number) => [401, 404, 405].includes(status ?? 0);

export const usersService = {

  // GET /users/me  — returns authenticated user profile
  // Backend may return PascalCase keys — normalise so the rest of the app gets consistent fields
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.ME);
    const d = response.data as any;
    if (!d) return d;
    // Detect PascalCase and normalise
    if (d.FirstName || d.LastName || d.UserName || d.Phone || d.Age) {
      return {
        ...d,
        first_name:  d.FirstName  || d.first_name  || '',
        last_name:   d.LastName   || d.last_name   || '',
        name:        d.UserName   || d.Username    || d.user_name || d.name || '',
        email:       d.Email      || d.email       || '',
        age:         d.Age        || d.age         || 25,
        gender:      d.Gender     || d.gender      || 'male',
        phone:       d.Phone      || d.phone       || '',
        bio:         d.Bio        || d.bio         || '',
        career:      d.Career     || d.career      || '',
      } as User;
    }
    return d as User;
  },

  // PUT /update/user — exact Swagger body: age, bio, career, church_branch, church_name,
  // denomination, gender, interests[], key, looking_for, profile_image
  async updateProfile(data: UpdateProfileData): Promise<any> {
    try {
      // Send only defined (non-undefined) fields
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined && v !== null) payload[k] = v;
      }
      console.log('📤 PUT /update/user', payload);
      const response = await apiClient.put(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, payload);
      console.log('✅ Profile update response:', response.data);
      // Persist updated data to localStorage for app-context
      if (response.data && typeof window !== 'undefined') {
        const existing = localStorage.getItem('user');
        const merged = { ...(existing ? JSON.parse(existing) : {}), ...response.data };
        localStorage.setItem('user', JSON.stringify(merged));
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ PUT /update/user:', error.response?.status, error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error  ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to update profile'
      );
    }
  },

  // POST /profile/upload/image  — multipart/form-data, field name is 'file' (not 'image'!)
  async uploadPhoto(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);   // Swagger: field name is 'file', type file (formData)
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PROFILE.UPLOAD_IMAGE,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      // Response: 200 { additionalProp1, 2, 3 } — try common image URL field names
      return (
        response.data.url ||
        response.data.imageUrl ||
        response.data.image_url ||
        response.data.profile_image ||
        response.data.additionalProp1 ||
        ''
      );
    } catch (error: any) {
      if (!silent(error.response?.status)) {
        console.error('Upload photo error:', error.response?.data || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to upload photo');
    }
  },

  // GET /users/by/admin  — all users except current user (no query params per swagger)
  async discoverUsers(filters?: DiscoverFilters): Promise<User[]> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.BY_ADMIN);
      const users: User[] = response.data.users || response.data || [];
      
      // Apply filters client-side since the endpoint takes no params
      return users.filter(u => {
        if (filters?.ageMin && u.age && u.age < filters.ageMin) return false;
        if (filters?.ageMax && u.age && u.age > filters.ageMax) return false;
        if (filters?.tier && filters.tier !== 'all' && u.tier !== filters.tier) return false;
        return true;
      });
    } catch (error: any) {
      if (!silent(error.response?.status)) {
        console.error('Discover users error:', error.response?.data || error.message);
      }
      return [];
    }
  },

  // GET /profile/{id}  — get user profile by UUID path param
  // Response: { age, bio, career, church_branch, church_name, created_at, denomination,
  //             gender, id, interests[], key, looking_for, profile_image, user_id }
  async getUserById(userId: string): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PROFILE.GET_BY_ID}/${userId}`);
      return response.data;
    } catch (error: any) {
      if (!silent(error.response?.status)) {
        console.error('Get profile error:', error.response?.data || error.message);
      }
      throw new Error(error.response?.data?.message || 'Profile not found');
    }
  },

  // PUT /users/location  — body: { location: string }
  // The swagger shows a simple string field named "location" (not lat/lng object)
  async updateLocation(locationString: string): Promise<void> {
    try {
      await apiClient.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_LOCATION, {
        location: locationString,
      });
    } catch (error: any) {
      if (!silent(error.response?.status)) {
        console.error('Update location error:', error.response?.data || error.message);
      }
      // Non-blocking — location update failure shouldn't break the app
    }
  },

  // DELETE /delete/user  — deletes the authenticated user account
  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete(API_CONFIG.ENDPOINTS.USERS.DELETE);
    } catch (error: any) {
      if (!silent(error.response?.status)) {
        console.error('Delete account error:', error.response?.data || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  },
};

export default usersService;