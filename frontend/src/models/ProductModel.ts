import { BaseModel, ModelMapper } from './BaseModel';

export interface ProductApiResponse {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  stockQuantity: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Product Model - Lớp domain model cho sản phẩm
 */
export class ProductModel extends BaseModel {
  name: string;
  price: number;
  description: string;
  image: string;
  categoryId?: string;
  category?: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    name: string,
    price: number,
    stockQuantity: number = 0,
    isActive: boolean = true
  ) {
    super(id);
    this.name = name;
    this.price = price;
    this.description = '';
    this.image = '';
    this.stockQuantity = stockQuantity;
    this.isActive = isActive;
  }

  /**
   * Kiểm tra sản phẩm có còn hàng không
   */
  isInStock(): boolean {
    return this.stockQuantity > 0;
  }

  /**
   * Tính giá sau giảm giá
   */
  getDiscountedPrice(discountPercent: number): number {
    if (discountPercent <= 0 || discountPercent >= 100) {
      return this.price;
    }
    return this.price * (1 - discountPercent / 100);
  }

  /**
   * Tính giá trị định dạng tiền Việt
   */
  getFormattedPrice(): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(this.price);
  }
}

/**
 * Mapper để chuyển đổi từ API response sang ProductModel
 */
export const productMapper: ModelMapper<ProductApiResponse, ProductModel> = (apiData) => {
  const product = new ProductModel(
    apiData.id,
    apiData.name,
    apiData.price,
    apiData.stockQuantity,
    apiData.active
  );

  product.description = apiData.description || '';
  product.image = apiData.imageUrl || '';
  product.categoryId = apiData.categoryId;
  product.category = apiData.categoryName;

  if (apiData.createdAt) {
    product.createdAt = new Date(apiData.createdAt);
  }

  if (apiData.updatedAt) {
    product.updatedAt = new Date(apiData.updatedAt);
  }

  return product;
}; 