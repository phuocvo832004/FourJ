/**
 * Dịch vụ quản lý cache sử dụng localStorage
 * Giúp giảm số lượng API calls cho dữ liệu ít thay đổi
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

interface StorageCacheConfig {
  prefix: string;
  defaultExpiry: number;
}

export class StorageCache {
  private prefix: string;
  private defaultExpiry: number;

  constructor(config: StorageCacheConfig = { prefix: 'app_cache_', defaultExpiry: 60 * 60 * 1000 }) {
    this.prefix = config.prefix;
    this.defaultExpiry = config.defaultExpiry;
  }

  /**
   * Lưu dữ liệu vào cache
   * @param key Khóa cache
   * @param value Giá trị cần lưu
   * @param expiryMs Thời gian hết hạn tính bằng ms (mặc định: 1 giờ)
   */
  set<T>(key: string, value: T, expiryMs: number = this.defaultExpiry): void {
    try {
      const cacheKey = this.getCacheKey(key);
      const now = new Date().getTime();
      const item: CacheEntry<T> = {
        value,
        expiry: now + expiryMs
      };
      localStorage.setItem(cacheKey, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting localStorage cache:', error);
    }
  }

  /**
   * Lấy dữ liệu từ cache
   * @param key Khóa cache
   * @returns Giá trị nếu còn trong thời hạn, ngược lại trả về null
   */
  get<T>(key: string): T | null {
    try {
      const cacheKey = this.getCacheKey(key);
      const itemStr = localStorage.getItem(cacheKey);
      
      if (!itemStr) return null;
      
      const item: CacheEntry<T> = JSON.parse(itemStr);
      const now = new Date().getTime();
      
      // Kiểm tra đã hết hạn chưa
      if (now > item.expiry) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error getting localStorage cache:', error);
      return null;
    }
  }

  /**
   * Xóa một mục khỏi cache
   * @param key Khóa cache cần xóa
   */
  remove(key: string): void {
    try {
      const cacheKey = this.getCacheKey(key);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error removing localStorage cache:', error);
    }
  }

  /**
   * Xóa tất cả cache hoặc theo pattern
   * @param pattern Pattern để xóa các key phù hợp (tuỳ chọn)
   */
  clear(pattern?: string): void {
    try {
      if (pattern) {
        // Xóa cache theo pattern
        const fullPattern = this.getCacheKey(pattern);
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix) && key.includes(fullPattern)) {
            localStorage.removeItem(key);
          }
        }
      } else {
        // Xóa tất cả cache của ứng dụng
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing localStorage cache:', error);
    }
  }

  /**
   * Tạo khóa cache đầy đủ với prefix
   */
  private getCacheKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

// Khởi tạo instance mặc định với 30 phút hết hạn
export const storageCache = new StorageCache({
  prefix: 'ecommerce_', 
  defaultExpiry: 30 * 60 * 1000 // 30 phút
}); 