import { useState, useCallback, useEffect } from 'react';
import { BaseModel, Repository } from '../models/BaseModel';
import { createLogger } from '../utils/logger';

const logger = createLogger('useRepository');

interface UseRepositoryOptions<T> {
  initialFetch?: boolean;
  onSuccess?: (data: T[] | T | boolean) => void;
  onError?: (error: Error) => void;
}

interface UseRepositoryResult<T extends BaseModel> {
  data: T[] | null;
  item: T | null;
  loading: boolean;
  error: Error | null;
  fetch: () => Promise<T[] | null>;
  fetchById: (id: string) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
}

/**
 * Custom hook để sử dụng repositories
 */
export function useRepository<T extends BaseModel>(
  repository: Repository<T>,
  options: UseRepositoryOptions<T> = {}
): UseRepositoryResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const { initialFetch = false, onSuccess, onError } = options;

  // Hàm fetch danh sách items
  const fetch = useCallback(async (): Promise<T[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await repository.findAll();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      logger.error('Error fetching data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository, onSuccess, onError]);

  // Hàm fetch một item theo ID
  const fetchById = useCallback(async (id: string): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await repository.findById(id);
      setItem(result);
      
      if (onSuccess && result) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      logger.error(`Error fetching item with ID ${id}:`, error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository, onSuccess, onError]);

  // Hàm tạo mới item
  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await repository.create(data);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      logger.error('Error creating item:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository, onSuccess, onError]);

  // Hàm cập nhật item
  const update = useCallback(async (id: string, data: Partial<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await repository.update(id, data);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      logger.error(`Error updating item with ID ${id}:`, error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [repository, onSuccess, onError]);

  // Hàm xóa item
  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await repository.delete(id);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (onError) {
        onError(error);
      }
      
      logger.error(`Error deleting item with ID ${id}:`, error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [repository, onSuccess, onError]);

  // Fetch dữ liệu ban đầu nếu được yêu cầu
  useEffect(() => {
    if (initialFetch) {
      fetch();
    }
  }, [initialFetch, fetch]);

  return {
    data,
    item,
    loading,
    error,
    fetch,
    fetchById,
    create,
    update,
    remove,
  };
} 