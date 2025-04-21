import React, { useState, ReactNode } from 'react';
import { AxiosError, AxiosRequestConfig } from 'axios';
import apiClient from './apiClient';
import { ApiContext } from './ApiContext';

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      return Promise.reject(errorMessage);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
    setError(errorMessage);
    return Promise.reject(errorMessage);
  };

  const apiGet = async <T,>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await apiClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      return handleError(error) as Promise<T>;
    } finally {
      setIsLoading(false);
    }
  };

  const apiPost = async <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      return handleError(error) as Promise<T>;
    } finally {
      setIsLoading(false);
    }
  };

  const apiPut = async <T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await apiClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      return handleError(error) as Promise<T>;
    } finally {
      setIsLoading(false);
    }
  };

  const apiDelete = async <T,>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      return handleError(error) as Promise<T>;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    error,
    clearError,
    apiGet,
    apiPost,
    apiPut,
    apiDelete
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}; 