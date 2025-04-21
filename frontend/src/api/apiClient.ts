import axios from 'axios';

// Lấy URL API từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';
const API_VERSION = import.meta.env.VITE_API_VERSION || '/api';

// Create base axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm cấu hình CORS
apiClient.defaults.withCredentials = false;

// Add request interceptor to attach auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific errors here (e.g., 401 unauthorized, etc.)
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      console.error('Authentication error');
    }
    return Promise.reject(error);
  }
);

export default apiClient; 