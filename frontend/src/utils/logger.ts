/**
 * Logger Service - Quản lý log tập trung
 * Sử dụng environment variable để bật/tắt log khi cần
 */

/**
 * Cấu hình các mức độ log
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LoggerConfig {
  minLevel: LogLevel;
  includeTimestamp: boolean;
  enableConsoleLogs: boolean;
  enableRemoteLogging: boolean;
  remoteLogEndpoint?: string;
}

/**
 * Class Logger để quản lý và thống nhất các logs trong ứng dụng
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig = {
    minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    includeTimestamp: true,
    enableConsoleLogs: true,
    enableRemoteLogging: process.env.NODE_ENV === 'production',
    remoteLogEndpoint: process.env.REACT_APP_LOG_ENDPOINT,
  };

  private loggers: Map<string, Logger> = new Map();

  /**
   * Constructor riêng tư để enforce Singleton pattern
   */
  private constructor(private namespace: string) {}

  /**
   * Tạo hoặc lấy một instance của Logger
   * @param namespace - Namespace để phân biệt các logger
   */
  public static getLogger(namespace: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger('root');
    }
    
    if (!namespace || namespace === 'root') {
      return Logger.instance;
    }

    // Kiểm tra cache trước khi tạo logger mới
    if (!Logger.instance.loggers.has(namespace)) {
      Logger.instance.loggers.set(namespace, new Logger(namespace));
    }
    
    return Logger.instance.loggers.get(namespace)!;
  }

  /**
   * Cấu hình logger
   * @param config - Cấu hình cho logger
   */
  public static configure(config: Partial<LoggerConfig>): void {
    if (!Logger.instance) {
      Logger.instance = new Logger('root');
    }
    
    Logger.instance.config = { ...Logger.instance.config, ...config };
  }

  /**
   * Format message log
   */
  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = this.config.includeTimestamp ? `[${new Date().toISOString()}]` : '';
    const namespaceStr = this.namespace ? `[${this.namespace}]` : '';
    const levelStr = `[${level}]`;
    
    return `${timestamp}${namespaceStr}${levelStr} ${message}`;
  }

  /**
   * Gửi log đến server
   */
  private async sendRemoteLog(level: LogLevel, message: string, data?: unknown): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteLogEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteLogEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          namespace: this.namespace,
          timestamp: new Date().toISOString(),
          data,
        }),
      });
    } catch (error) {
      // Fallback để tránh vòng lặp vô hạn
      if (this.config.enableConsoleLogs) {
        console.error('Failed to send remote log:', error);
      }
    }
  }

  /**
   * Log debug message
   */
  public debug(message: string, data?: unknown): void {
    if (this.config.minLevel <= LogLevel.DEBUG) {
      const formattedMessage = this.formatMessage('DEBUG', message, data);
      
      if (this.config.enableConsoleLogs) {
        console.debug(formattedMessage, data);
      }
      
      this.sendRemoteLog(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Log info message
   */
  public info(message: string, data?: unknown): void {
    if (this.config.minLevel <= LogLevel.INFO) {
      const formattedMessage = this.formatMessage('INFO', message, data);
      
      if (this.config.enableConsoleLogs) {
        console.info(formattedMessage, data);
      }
      
      this.sendRemoteLog(LogLevel.INFO, message, data);
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, data?: unknown): void {
    if (this.config.minLevel <= LogLevel.WARN) {
      const formattedMessage = this.formatMessage('WARN', message, data);
      
      if (this.config.enableConsoleLogs) {
        console.warn(formattedMessage, data);
      }
      
      this.sendRemoteLog(LogLevel.WARN, message, data);
    }
  }

  /**
   * Log error message
   */
  public error(message: string, error?: unknown): void {
    if (this.config.minLevel <= LogLevel.ERROR) {
      const formattedMessage = this.formatMessage('ERROR', message, error);
      
      if (this.config.enableConsoleLogs) {
        console.error(formattedMessage, error);
      }
      
      this.sendRemoteLog(LogLevel.ERROR, message, error);
    }
  }
}

/**
 * Helper function để tạo logger
 * @param namespace - Namespace cho logger
 */
export const createLogger = (namespace: string): Logger => {
  return Logger.getLogger(namespace);
};

/**
 * Default logger cho toàn bộ ứng dụng
 */
export const defaultLogger = Logger.getLogger('app');

export default Logger; 