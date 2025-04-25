import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ErrorBoundary');

interface ErrorBoundaryProps {
  /** Component con */
  children: ReactNode;
  
  /** Component hiển thị khi có lỗi */
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  
  /** Callback khi có lỗi xảy ra */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** Mô tả vị trí/chức năng của error boundary này */
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component bắt và xử lý lỗi trong React
 * 
 * ErrorBoundary sẽ chặn lỗi và hiển thị fallback UI thay vì để ứng dụng crash
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { name = 'unnamed', onError } = this.props;
    
    // Log lỗi
    logger.error(`Error in ${name} boundary:`, error);
    logger.error(`Component stack:`, errorInfo.componentStack);
    
    // Gọi callback nếu được cung cấp
    if (onError) {
      onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Nếu fallback là function, gọi nó với error hiện tại
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }
      
      // Sử dụng fallback đã cung cấp
      if (fallback) {
        return fallback;
      }
      
      // Fallback mặc định nếu không có prop fallback
      return (
        <div className="error-boundary">
          <h2>Đã xảy ra lỗi</h2>
          <p>{error.message}</p>
          <button 
            onClick={this.resetError} 
            className="px-4 py-2 mt-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return children;
  }
}

/**
 * HOC bao bọc component với ErrorBoundary
 * @param Component - Component cần bọc
 * @param errorBoundaryProps - Props cho ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps} name={errorBoundaryProps.name || displayName}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  return WrappedComponent;
}

/**
 * Hook để tạo và sử dụng error boundary theo function
 */
export function useErrorBoundary(): {
  ErrorBoundary: typeof ErrorBoundary;
  withErrorBoundary: typeof withErrorBoundary;
} {
  return {
    ErrorBoundary,
    withErrorBoundary
  };
}

export default ErrorBoundary; 