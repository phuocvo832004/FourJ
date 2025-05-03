import { AxiosRequestConfig } from 'axios';

export interface ApiContextType {
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  apiGet: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  apiPost: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  apiPut: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  apiDelete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
} 