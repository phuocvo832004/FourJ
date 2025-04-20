import axios from 'axios';

// Create base axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8087',
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