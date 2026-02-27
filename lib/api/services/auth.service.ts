import { toast } from 'sonner';
import apiClient from '../client';
import { API_CONFIG } from '../config';
import { AxiosResponse } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  user_name: string;
  first_name:string;
  last_name:string;
  email: string;
  password: string;
  confirmPassword?: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  denomination?: string;
  bio?: string;
  career?: string;
  location?: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
}

export interface AuthResponse {
  token?: string;
  user?: any;
  data?: any;
  message?: string;
}

export const authService = {
  /**
   * Login user - SIMPLIFIED VERSION
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login...');
      console.log('Email:', credentials.email);
      
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN, 
        credentials
      );
      
      console.log('✅ Login successful!');
      console.log('Response:', response.data);
      
      // Extract token and user from response
      const { token, username, id, type } = response.data;
      
      // Store token
      if (token) {
        localStorage.setItem('auth_token', token);
        console.log('✅ Token stored');
      }
      
      // Store user info
      const userInfo = {
        id,
        username,
        email: credentials.email,
        type,
      };
      
      return {
        token,
        user: userInfo,
        data: response.data
      };
      
    } catch (error: any) {
      console.error('❌ Login failed');
      console.error('Error:', error.message);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data
        || error.message 
        || 'Login failed';
      
      throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AxiosResponse> {
    try {
      console.log('📝 Attempting registration...');
      
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER, 
        data
      );
      
   
      
      // Extract token and user
      return response.data
    } catch (error: any) {
      console.error('❌ Registration failed');
      console.error('Error:', error.response?.data || error.message);
      toast.error(error?.response?.data)
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Registration failed';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Don't call logout endpoint if it doesn't exist
      // await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      console.log('🚪 Logging out...');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      console.log('✅ Logged out');
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  /**
   * Get current auth token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },
  
  /**
   * Get stored user info
   */
  getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};

export default authService;