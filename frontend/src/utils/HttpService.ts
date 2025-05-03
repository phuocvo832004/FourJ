import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { createLogger } from './logger';

const logger = createLogger('HttpService');

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Interface cho error response
export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

interface HttpServiceConfig extends AxiosRequestConfig {
  baseURL: string;
  withCredentials?: boolean;
  timeout?: number;
  useAuth?: boolean;
}

/**
 * Service cơ bản để xử lý các HTTP request
 * Hỗ trợ interceptor, refresh token, error handling, và caching
 */
export class HttpService {
  private instance: AxiosInstance;
  private useAuth: boolean;

  constructor(config: HttpServiceConfig) {
    const { useAuth = true, ...axiosConfig } = config;
    this.useAuth = useAuth;
    this.instance = axios.create(axiosConfig);

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        if (this.useAuth) {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        // Handle refresh token logic
        if (
          error.response?.status === 401 &&
          this.useAuth &&
          error.config && 
          !error.config.__isRetry
        ) {
          try {
            // TODO: Thực hiện refresh token nếu cần
            // const refreshResult = await authService.refreshToken();
            // if (refreshResult) {
            //   // Retry request with new token
            //   error.config.__isRetry = true;
            //   error.config.headers.Authorization = `Bearer ${localStorage.getItem('auth_token')}`;
            //   return this.instance(error.config);
            // }
          } catch (refreshError) {
            logger.error('Refresh token failed:', refreshError);
            // TODO: Redirect to login
          }
        }
        
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError<ApiErrorResponse>): void {
    if (error.response) {
      // Lỗi response từ server
      logger.error(
        `API Error ${error.response.status}: ${error.response.statusText}`,
        error.response.data
      );
    } else if (error.request) {
      // Request đã gửi nhưng không nhận được response
      logger.error('Network Error: No response received', error);
    } else {
      // Lỗi khi thiết lập request
      logger.error('Request Error:', error.message);
    }
  }

  // GET request
  public async get<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  // POST request
  public async post<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  // PUT request
  public async put<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  // PATCH request
  public async patch<T>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  // DELETE request
  public async delete<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError);
    }
  }

  // Normalize error for consistent handling
  private normalizeError(error: AxiosError): Error {
    if (error.response?.data) {
      const data = error.response.data as ApiErrorResponse;
      const errorMessage = data.message || 
        `Request failed with status ${error.response.status}`;
      return new Error(errorMessage);
    }
    return error as Error;
  }
}

// Create default HttpService instance
export const apiService = new HttpService({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: false
}); 