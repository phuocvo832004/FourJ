import { useQuery, UseQueryOptions, QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('useCachingQuery');

export interface CachingQueryOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'> {
  /**
   * Thời gian (ms) mà dữ liệu vẫn được coi là "fresh". Sau thời gian này, dữ liệu sẽ được revalidate.
   */
  staleTime?: number;
  
  /**
   * Thời gian (ms) mà dữ liệu được lưu trong cache. Mặc định là 5 phút.
   */
  cacheTime?: number;
  
  /**
   * Nếu true, sẽ gọi API ngay cả khi dữ liệu đã có trong cache.
   */
  forceRefresh?: boolean;
}

/**
 * Hook tùy chỉnh để cache dữ liệu API với React Query
 * @param queryKey - Khóa duy nhất để định danh query
 * @param queryFn - Hàm fetch dữ liệu
 * @param options - Cấu hình tùy chọn cho query
 */
export function useCachingQuery<TData = unknown, TError = unknown>(
  queryKey: string | unknown[],
  queryFn: () => Promise<TData>,
  options?: CachingQueryOptions<TData, TError>
) {
  const queryClient = useQueryClient();
  
  const defaultOptions: CachingQueryOptions<TData, TError> = {
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    ...options
  };
  
  // Nếu forceRefresh = true, gọi API mà không quan tâm đến cache
  if (options?.forceRefresh) {
    logger.info(`Force refreshing data for query: ${Array.isArray(queryKey) ? queryKey[0] : queryKey}`);
    queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
  }
  
  const query = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn,
    ...defaultOptions
  });
  
  return {
    ...query,
    // Helper cho prefetch
    prefetch: async () => {
      logger.info(`Prefetching data for query: ${Array.isArray(queryKey) ? queryKey[0] : queryKey}`);
      await queryClient.prefetchQuery({
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
        queryFn,
        ...defaultOptions
      });
    },
    // Helper cho invalidate cache
    invalidate: async () => {
      logger.info(`Invalidating cache for query: ${Array.isArray(queryKey) ? queryKey[0] : queryKey}`);
      await queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
    },
    // Helper cho update cache
    updateCache: (newData: TData) => {
      logger.info(`Updating cache for query: ${Array.isArray(queryKey) ? queryKey[0] : queryKey}`);
      queryClient.setQueryData(Array.isArray(queryKey) ? queryKey : [queryKey], newData);
    }
  };
}

/**
 * Tùy chọn để prefetch dữ liệu
 */
export interface PrefetchOptions {
  staleTime?: number;
  cacheTime?: number;
}

/**
 * Helper để prefetch nhiều query cùng lúc
 * @param queryClient - React Query client
 * @param queries - Danh sách các query cần prefetch
 * @param options - Cấu hình cho việc prefetch
 */
export const prefetchQueries = async (
  queryClient: QueryClient,
  queries: Array<{ queryKey: unknown; queryFn: () => Promise<unknown> }>,
  options?: PrefetchOptions
) => {
  const defaultOptions = {
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
    ...options
  };
  
  logger.info(`Prefetching ${queries.length} queries`);
  const promises = queries.map(({ queryKey, queryFn }) => 
    queryClient.prefetchQuery({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      queryFn,
      ...defaultOptions
    })
  );
  
  return Promise.all(promises);
};

/**
 * Hook để xử lý pagination với cache
 * @param baseQueryKey - Khóa cơ bản cho query
 * @param fetchPage - Hàm fetch dữ liệu cho trang cụ thể
 * @param options - Cấu hình tùy chọn
 */
export function usePaginatedQuery<TData = unknown, TError = unknown>(
  baseQueryKey: string | unknown[],
  fetchPage: (page: number) => Promise<TData>,
  options?: CachingQueryOptions<TData, TError> & { initialPage?: number }
) {
  const queryClient = useQueryClient();
  const { initialPage = 1, ...restOptions } = options || {};
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const queryKey = Array.isArray(baseQueryKey) 
    ? [...baseQueryKey, { page: currentPage }]
    : [baseQueryKey, { page: currentPage }];
  
  const query = useCachingQuery<TData, TError>(
    queryKey,
    () => fetchPage(currentPage),
    restOptions
  );
  
  // Prefetch trang tiếp theo
  const prefetchNextPage = useCallback(async () => {
    const nextPage = currentPage + 1;
    const nextPageQueryKey = Array.isArray(baseQueryKey)
      ? [...baseQueryKey, { page: nextPage }]
      : [baseQueryKey, { page: nextPage }];
      
    logger.info(`Prefetching next page: ${nextPage}`);
    await queryClient.prefetchQuery({
      queryKey: nextPageQueryKey,
      queryFn: () => fetchPage(nextPage),
      ...restOptions
    });
  }, [baseQueryKey, currentPage, fetchPage, queryClient, restOptions]);
  
  return {
    ...query,
    currentPage,
    setPage: setCurrentPage,
    prefetchNextPage
  };
}

export default useCachingQuery;