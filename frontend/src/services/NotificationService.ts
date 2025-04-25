/**
 * Notification Service
 * Cung cấp các phương thức xử lý thông báo cho người dùng
 * Lớp này có thể được mở rộng để tích hợp với bất kỳ thư viện thông báo nào
 */

import { createLogger } from '../utils/logger';

const logger = createLogger('NotificationService');

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number;
  position?: 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClose?: () => void;
}

// Interface cho các adapter thông báo
export interface NotificationAdapter {
  show(options: NotificationOptions): void;
  success(message: string, title?: string): void;
  error(message: string, title?: string): void;
  info(message: string, title?: string): void;
  warning(message: string, title?: string): void;
}

// Adapter mặc định cho console (fallback)
export class ConsoleNotificationAdapter implements NotificationAdapter {
  show(options: NotificationOptions): void {
    const { title, message, type } = options;
    const formattedTitle = title ? `${title}: ` : '';

    switch (type) {
      case 'success':
        logger.info(`✅ ${formattedTitle}${message}`);
        break;
      case 'error':
        logger.error(`❌ ${formattedTitle}${message}`);
        break;
      case 'warning':
        logger.warn(`⚠️ ${formattedTitle}${message}`);
        break;
      case 'info':
      default:
        logger.info(`ℹ️ ${formattedTitle}${message}`);
        break;
    }

    if (options.onClose) {
      options.onClose();
    }
  }

  success(message: string, title?: string): void {
    this.show({ title, message, type: 'success' });
  }

  error(message: string, title?: string): void {
    this.show({ title, message, type: 'error' });
  }

  info(message: string, title?: string): void {
    this.show({ title, message, type: 'info' });
  }

  warning(message: string, title?: string): void {
    this.show({ title, message, type: 'warning' });
  }
}

// Singleton service
class NotificationService {
  private adapter: NotificationAdapter;
  private static instance: NotificationService;

  private constructor() {
    // Mặc định sử dụng console adapter
    this.adapter = new ConsoleNotificationAdapter();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Thiết lập adapter tùy chỉnh
  public setAdapter(adapter: NotificationAdapter): void {
    this.adapter = adapter;
    logger.info('Notification adapter đã được thiết lập');
  }

  // Hiển thị thông báo
  public show(options: NotificationOptions): void {
    this.adapter.show(options);
  }

  // Các phương thức tiện ích
  public success(message: string, title?: string): void {
    this.adapter.success(message, title);
  }

  public error(message: string, title?: string): void {
    this.adapter.error(message, title);
  }

  public info(message: string, title?: string): void {
    this.adapter.info(message, title);
  }

  public warning(message: string, title?: string): void {
    this.adapter.warning(message, title);
  }

  // Xử lý lỗi API tự động
  public handleApiError(error: Error): void {
    const message = error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    this.error(message, 'Lỗi API');
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export mặc định
export default notificationService; 