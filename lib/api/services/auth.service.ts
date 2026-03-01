import apiClient from '../client';
import { API_CONFIG } from '../config';

export interface LoginCredentials {
  email: string;
  password: string;
}

// POST /users/register — field names as expected by backend
export interface RegisterData {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword?: string;  // optional — not sent to backend, used for UI validation only
  age: number;
  gender: 'male' | 'female';
  phone: string;
  denomination?: string;
  bio?: string;
}

export interface AuthResponse {
  token?: string;
  user?: any;
  data?: any;
  message?: string;
}

export const authService = {

  // POST /users/login
  // Errors: 400 invalid payload, 401 invalid password, 404 user not found
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data;
      const token = data.token || data.accessToken || data.jwt;
      const user = data.user || data;

      if (token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { token, user, data };

    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.response?.data || error.message || 'Login failed';
      if (status === 401) throw new Error('Incorrect password. Please try again.');
      if (status === 404) throw new Error('No account found with that email address.');
      if (status === 400) throw new Error('Please enter a valid email and password.');
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  },

  // POST /users/register → 201 Created
  // Errors: 400 invalid payload, 409 user already exists
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Build explicit payload with exact field names the backend expects
      const payload: Record<string, any> = {
        user_name: data.user_name,
        username: data.user_name,   // send both variants as safety net
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        gender: data.gender,
        age: data.age,
      };
      if (data.denomination) payload.denomination = data.denomination;

      console.log('📋 Register payload:', JSON.stringify(payload));

      // Try JSON first
      let response;
      try {
        response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (jsonError: any) {
        if (jsonError.response?.status === 400) {
          // Fallback: try form-urlencoded
          console.log('📋 JSON failed, retrying as form-urlencoded...');
          const formData = new URLSearchParams();
          Object.entries(payload).forEach(([k, v]) => formData.append(k, String(v)));
          response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });
        } else {
          throw jsonError;
        }
      }

      const resData = response.data;
      const token = resData.token || resData.accessToken || resData.jwt;
      const user = resData.user || resData;

      if (token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { token, user, data: resData };

    } catch (error: any) {
      const status = error.response?.status;
      const raw = error.response?.data;
      const msg = (typeof raw === 'string' ? raw : null)
        || raw?.message
        || raw?.error
        || raw?.detail
        || error.message
        || 'Registration failed';
      console.error('Register error response:', JSON.stringify(error.response?.data));
      if (status === 409) throw new Error('An account with this email already exists.');
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  },

  // NOTE: There is no POST /logout or /auth/refresh in the Swagger spec.
  // Logout is handled entirely client-side by clearing localStorage.
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem('user');
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  },
};

export default authService;