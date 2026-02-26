import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from './config';

// Create axios instance with minimal configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log the request for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: config.baseURL + (config.url ?? ''),
        headers: config.headers,
        data: config.data
      });
    }

    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Response error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // Attempt to refresh token if refresh token exists
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
              refresh_token: refreshToken
            }, { timeout: 30000 });
            
            if (refreshResponse.data?.access_token) {
              localStorage.setItem('auth_token', refreshResponse.data.access_token);
              if (refreshResponse.data?.refresh_token) {
                localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);
              }
              
              // Retry the original request (only once to prevent infinite loops)
              if (error.config && !(error.config as any)._retry) {
                (error.config as any)._retry = true;
                error.config.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
                return apiClient(error.config);
              }
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup');
            const isHomePage = currentPath === '/';
            
            if (!isAuthPage && !isHomePage) {
              window.location.href = '/login';
            }
          }
        } else {
          // No refresh token, clear tokens and redirect
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup');
          const isHomePage = currentPath === '/';
          
          if (!isAuthPage && !isHomePage) {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;