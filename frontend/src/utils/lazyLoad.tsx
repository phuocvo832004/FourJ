import React, { lazy, Suspense, ComponentType } from 'react';
import { createLogger } from './logger';

const logger = createLogger('lazyLoad');

// Fallback component mặc định
const DefaultFallback: React.FC = () => (
  <div className="loading-spinner">Loading...</div>
);

/**
 * Lazy load một component với fallback mặc định
 * @param importFn - Dynamic import function
 * @param customFallback - Component hiển thị khi đang tải
 */
export const lazyLoad = <Props extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<Props> }>,
  customFallback: React.ReactNode = <DefaultFallback />
): React.FC<Props> => {
  // Tạo lazy component
  const LazyComponent = lazy(importFn);

  logger.debug('Creating lazy loaded component');
  
  // Wrapper với Suspense
  const LazyLoadedComponent: React.FC<Props> = (props) => (
    <Suspense fallback={customFallback}>
      <LazyComponent {...props} />
    </Suspense>
  );

  return LazyLoadedComponent;
};

/**
 * Prefetch một component để load trước
 * @param importFn - Dynamic import function
 */
export const prefetchComponent = (
  importFn: () => Promise<{ default: ComponentType<unknown> }>
): void => {
  logger.info('Prefetching component');
  importFn().catch(error => {
    logger.warn('Prefetch failed', error);
  });
};

/**
 * Tạo lazy component với retry khi load thất bại
 * @param importFn - Dynamic import function
 * @param maxRetries - Số lần retry tối đa
 * @param fallback - Component hiển thị khi đang tải
 */
export function lazyLoadWithRetry<Props extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<Props> }>,
  maxRetries = 2,
  fallback: React.ReactNode = <DefaultFallback />
): React.FC<Props> {
  // Hàm import với retry logic
  const loadWithRetry = async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await importFn();
        logger.info(`Component loaded successfully ${i > 0 ? `after ${i} retries` : ''}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Failed to load component, retry ${i}/${maxRetries}`, error);
        
        if (i < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * 2 ** i, 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Nếu vẫn lỗi sau khi retry
    logger.error('Failed to load component after maximum retries', lastError);
    throw lastError || new Error('Component loading failed');
  };
  
  // Tạo lazy component với retry logic
  const LazyComponentWithRetry = lazy(loadWithRetry);
  
  // Trả về component với Suspense
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponentWithRetry {...props} />
    </Suspense>
  );
}

export default lazyLoad;

/**
 * HOC cho lazy loading page components
 * Sử dụng cho các routes
 */
export function withLazyLoading<P>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  loadingComponent: React.ReactNode = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
) {
  const LazyComponent = React.lazy(importFunc);

  return (props: P) => (
    <Suspense fallback={loadingComponent}>
      <LazyComponent {...props} />
    </Suspense>
  );
} 