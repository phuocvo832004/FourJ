import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken } from '../auth/auth-service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:80';
const API_VERSION = import.meta.env.VITE_API_VERSION || '/api';

// API công khai không cần token
const PUBLIC_API_PATHS = [
  '/products', 
  '/categories', 
  '/search/products', 
  '/search/suggestions'
];

// Thời gian mặc định cho cache là 5 phút
const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

// Cache để lưu trữ kết quả API
const apiCache = new Map<string, {
  data: unknown;
  timestamp: number;
  expiresIn: number;
}>();

// Pending requests để tránh trùng lặp
const pendingRequestsMap = new Map<string, Promise<AxiosResponse<unknown>>>();

// Helper function để tạo cache key từ config request
const getCacheKey = (config: AxiosRequestConfig | InternalAxiosRequestConfig): string => {
  const { url, method, params, data } = config;
  return `${method || 'GET'}_${url}_${JSON.stringify(params || {})}_${JSON.stringify(data || {})}`;
};

// Helper function để kiểm tra xem cache có hết hạn không
const isCacheExpired = (entry: { timestamp: number; expiresIn: number }): boolean => {
  return Date.now() > entry.timestamp + entry.expiresIn;
};

// Kiểm tra URL có phải là public API không
const isPublicApi = (url: string): boolean => {
  if (!url) return false;
  
  const basePath = url.split('?')[0];
  
  // Đảm bảo các đường dẫn đơn hàng không bị đánh dấu là public API
  if (basePath.includes('/orders/')) {
    return false;
  }
  
  return PUBLIC_API_PATHS.some(path => {
    return (basePath === path || basePath.startsWith(`${path}/`));
  });
};

// Extended Axios Interface
interface ExtendedAxiosInstance extends ReturnType<typeof axios.create> {
  clearCache: () => void;
  clearCacheByPattern: (urlPattern: string) => void;
}

const apiClient = axios.create({
  baseURL: `${API_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: true // Bật credentials để hỗ trợ cookie từ Kong OIDC
}) as ExtendedAxiosInstance;

// Interceptor cho request - thêm token nếu có
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Kiểm tra xem API có yêu cầu xác thực không
  const isPublic = isPublicApi(config.url || '');
  
  // Chỉ thêm token cho các API không công khai
  if (!isPublic) {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(`No token available for protected API call to: ${config.url}`);
        // Tiếp tục request mà không có token, backend sẽ trả về 401 nếu cần
      }
    } catch (error) {
      console.error(`Failed to get token for API call to: ${config.url}`, error);
      // Tiếp tục request để backend trả về 401 và frontend có thể xử lý sau
    }
  }
  
  return config;
}, error => Promise.reject(error));

// Interceptor cho response - xử lý lỗi token
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Xử lý lỗi từ server
    if (error.response) {
      const { status, data, config } = error.response;
      const errorMessage = data?.message || 'Lỗi không xác định';
      
      // Xóa khỏi pending requests khi có lỗi
      const cacheKey = getCacheKey(config);
      pendingRequestsMap.delete(cacheKey);
      
      // Xử lý lỗi liên quan đến token
      if (status === 401 || status === 403) {
        console.warn(`Unauthorized (${status}) access attempt to: ${config.url}`);
        
        // Lưu URL hiện tại để sau khi đăng nhập có thể quay lại
        if (window.location.pathname !== '/login') {
          localStorage.setItem('redirect_after_login', window.location.href);
          
          // Chuyển hướng đến trang login của ứng dụng
          // Trang này sẽ gọi Auth0 loginWithRedirect
          window.location.href = '/login';
        }
      } 
      
      error.errorMessage = errorMessage;
    } else if (error.request) {
      // Lỗi request mà không nhận được response (CORS, network error)
      console.error('Network Error or No Response:', error.message);
      if (error.message.includes('Network Error')) {
        console.error("Potential CORS issue or backend is down.");
      }
    }
    
    return Promise.reject(error);
  }
);

// Function để xóa cache
apiClient.clearCache = () => {
  apiCache.clear();
};

// Function để xóa cache theo pattern
apiClient.clearCacheByPattern = (urlPattern: string) => {
  for (const key of apiCache.keys()) {
    if (key.includes(urlPattern)) {
      apiCache.delete(key);
    }
  }
};

// Ghi đè phương thức get để thêm caching
const originalGet = apiClient.get;

// Hàm wrapper cho GET request có cache
const cachedGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  const fullConfig = { ...config, url, method: 'get' };
  const cacheKey = getCacheKey(fullConfig);
  
  // Kiểm tra nếu đã có request đang pending
  if (pendingRequestsMap.has(cacheKey)) {
    return pendingRequestsMap.get(cacheKey) as Promise<AxiosResponse<T>>;
  }
  
  // Kiểm tra cache
  const cachedResponse = apiCache.get(cacheKey);
  if (cachedResponse && !isCacheExpired(cachedResponse)) {
    const response = {
      data: cachedResponse.data,
      status: 200,
      statusText: 'OK (from cache)',
      headers: {},
      config: fullConfig
    } as AxiosResponse<T>;
    
    return response;
  }
  
  // Thực hiện request nếu không có cache
  try {
    const requestPromise = originalGet<T>(url, config).then(response => {
      // Lưu response vào cache
      apiCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
        expiresIn: DEFAULT_CACHE_TIME
      });
      
      // Xóa khỏi pending requests
      pendingRequestsMap.delete(cacheKey);
      
      return response;
    }).catch(error => {
      // Xóa khỏi pending requests khi có lỗi
      pendingRequestsMap.delete(cacheKey);
      throw error;
    });
    
    // Lưu promise vào pending requests
    pendingRequestsMap.set(cacheKey, requestPromise);
    return requestPromise;
  } catch (error) {
    pendingRequestsMap.delete(cacheKey);
    throw error;
  }
};

// Thay thế phương thức get
apiClient.get = cachedGet as typeof apiClient.get;

export default apiClient;