import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:80';
const API_VERSION = import.meta.env.VITE_API_VERSION || '/api';

// API công khai không cần token
const PUBLIC_API_PATHS = ['/products', '/categories'];

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
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
}) as ExtendedAxiosInstance;

apiClient.defaults.withCredentials = false;

// Request interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const isPublic = isPublicApi(config.url || '');
  
  // Thêm token cho request nếu không phải public API
  if (!isPublic) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log để debug - chỉ hiển thị độ dài token
      console.log(`[Debug] Đính kèm token cho ${config.url}, token length: ${token.length}`);
    } else {
      console.warn(`[Debug] Không tìm thấy token trong localStorage cho request ${config.url}`);
    }
  }
  
  // Log thông tin request cho phần debug
  console.log(`[Debug] Request to: ${config.method?.toUpperCase()} ${config.url}`, {
    isPublic,
    hasAuthHeader: !!config.headers.Authorization,
    baseURL: config.baseURL
  });
  
  return config;
}, error => Promise.reject(error));

// Response interceptor
apiClient.interceptors.response.use(response => {
  return response;
}, error => {
  // Xử lý lỗi từ server
  if (error.response) {
    const { status, data, config } = error.response;
    const errorMessage = data?.message || 'Lỗi không xác định';
    
    // Xóa khỏi pending requests khi có lỗi
    const cacheKey = getCacheKey(config);
    pendingRequestsMap.delete(cacheKey);
    
    // Kiểm tra xem request là public API không
    const isPublic = isPublicApi(config.url);
    
    console.error(`API Error ${status}: ${errorMessage}`, isPublic ? '(Public API)' : '');
    error.errorMessage = errorMessage;
    
    // Xử lý lỗi theo status code
    if (status === 401) {
      // Nếu là public API gặp lỗi 401, có thể do vấn đề gateway/routing
      if (isPublic) {
        console.error('Public API gặp lỗi xác thực. Có thể do cấu hình gateway không chính xác.');
        // Thử gọi lại không có header xác thực nếu là public API
        if (config.headers.Authorization) {
          console.log('Thử gọi lại API công khai không có token...');
          delete config.headers.Authorization;
          return axios(config);
        }
      } 
      // Nếu là API yêu cầu xác thực và ở trang checkout/payment
      else if (window.location.pathname.includes('/checkout') || 
               window.location.pathname.includes('/payment')) {
        localStorage.setItem('redirect_after_login', window.location.href);
        window.location.href = '/login';
      }
    } else if (status === 404) {
      console.error('API endpoint not found');
    } else if (status >= 500) {
      console.error('Server error - Please try again later');
    }
  } 
  // Lỗi network
  else if (error.request) {
    console.error('Network Error: No response received');
    error.errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
  } 
  // Lỗi khác
  else {
    console.error('Request Error:', error.message);
    error.errorMessage = `Lỗi khi gửi yêu cầu: ${error.message}`;
  }
  
  return Promise.reject(error);
});

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
    console.log(`Using cached response for: ${url}`);
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