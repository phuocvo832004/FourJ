import axios from 'axios';

// Lấy URL API từ biến môi trường
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:80';
const API_VERSION = import.meta.env.VITE_API_VERSION || '/api';

// Create base axios instance
const apiClient = axios.create({
  baseURL: `${API_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thêm timeout 10 giây
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
    // Xử lý lỗi cụ thể hơn
    if (error.response) {
      // Lỗi từ server với status code
      console.error(`API Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
      
      // Xử lý các lỗi HTTP cụ thể
      if (error.response.status === 401) {
        // Redirect to login or refresh token
        console.error('Authentication error - User needs to login');
      } else if (error.response.status === 404) {
        console.error('API endpoint not found');
      } else if (error.response.status >= 500) {
        console.error('Server error - Please try again later');
      }
    } else if (error.request) {
      // Lỗi không nhận được response (network error)
      console.error('Network Error: No response received from server');
    } else {
      // Lỗi khi setup request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 