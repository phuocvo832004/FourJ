/**
 * Model cơ sở cung cấp các phương thức chung cho tất cả các models
 * Giúp chuẩn hóa dữ liệu trong toàn bộ ứng dụng
 */
export abstract class BaseModel {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Phương thức chuyển đổi model thành plain object để serialize
   */
  toJSON(): Record<string, unknown> {
    return Object.entries(this).reduce((acc, [key, value]) => {
      // Loại bỏ các thuộc tính bắt đầu bằng '_'
      if (!key.startsWith('_')) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);
  }

  /**
   * So sánh model hiện tại với model khác
   */
  equals(other: BaseModel): boolean {
    if (!other) return false;
    return this.id === other.id;
  }

  /**
   * Kiểm tra model có hợp lệ không
   */
  isValid(): boolean {
    return !!this.id;
  }

  /**
   * Tạo bản sao của model
   */
  clone(): this {
    const Constructor = this.constructor as new (id: string) => this;
    const clone = new Constructor(this.id);
    
    // Copy tất cả các thuộc tính
    Object.entries(this).forEach(([key, value]) => {
      if (key !== 'id') {
        // Sử dụng index signature để tránh dùng any
        (clone as Record<string, unknown>)[key] = value;
      }
    });
    
    return clone;
  }
}

/**
 * Type cho mapper function - chuyển đổi từ API response sang domain model
 */
export type ModelMapper<ApiType, ModelType> = (apiData: ApiType) => ModelType;

/**
 * Type generic cho repository
 */
export interface Repository<T extends BaseModel> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
} 