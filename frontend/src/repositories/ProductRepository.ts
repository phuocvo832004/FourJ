import { Repository } from '../models/BaseModel';
import { ProductModel, ProductApiResponse, productMapper } from '../models/ProductModel';
import { apiService } from '../utils/HttpService';
import { createLogger } from '../utils/logger';

const logger = createLogger('ProductRepository');

// Interface cho các tham số query
export interface ProductQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  categoryId?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Repository cho Product - quản lý các thao tác CRUD với sản phẩm
 */
export class ProductRepository implements Repository<ProductModel> {
  private baseUrl: string;

  constructor(baseUrl = '/products') {
    this.baseUrl = baseUrl;
  }

  /**
   * Lấy danh sách tất cả sản phẩm
   */
  async findAll(params: ProductQueryParams = {}): Promise<ProductModel[]> {
    try {
      const response = await apiService.get<ProductApiResponse[]>(this.baseUrl, { params });
      return response.data.map(productMapper);
    } catch (error) {
      logger.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Lấy sản phẩm theo ID
   */
  async findById(id: string): Promise<ProductModel | null> {
    try {
      const response = await apiService.get<ProductApiResponse>(`${this.baseUrl}/${id}`);
      return productMapper(response.data);
    } catch (error) {
      logger.error(`Error fetching product with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Tạo sản phẩm mới
   */
  async create(data: Partial<ProductModel>): Promise<ProductModel> {
    try {
      // Chuyển đổi từ domain model sang API data
      const apiData = this.toApiData(data);
      
      const response = await apiService.post<ProductApiResponse>(this.baseUrl, apiData);
      return productMapper(response.data);
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Cập nhật sản phẩm
   */
  async update(id: string, data: Partial<ProductModel>): Promise<ProductModel> {
    try {
      // Chuyển đổi từ domain model sang API data
      const apiData = this.toApiData(data);
      
      const response = await apiService.put<ProductApiResponse>(`${this.baseUrl}/${id}`, apiData);
      return productMapper(response.data);
    } catch (error) {
      logger.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa sản phẩm
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting product with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Tìm kiếm sản phẩm
   */
  async search(queryParams: ProductQueryParams): Promise<{
    products: ProductModel[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await apiService.get<{
        content: ProductApiResponse[];
        totalElements: number;
        totalPages: number;
        number: number;
      }>(`${this.baseUrl}/search`, { params: queryParams });

      return {
        products: response.data.content.map(productMapper),
        totalItems: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.number,
      };
    } catch (error) {
      logger.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Lấy sản phẩm theo danh mục
   */
  async findByCategory(categoryId: string, params: ProductQueryParams = {}): Promise<ProductModel[]> {
    try {
      const response = await apiService.get<ProductApiResponse[]>(
        `${this.baseUrl}/category/${categoryId}`,
        { params }
      );
      return response.data.map(productMapper);
    } catch (error) {
      logger.error(`Error fetching products for category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Chuyển đổi từ domain model sang API data
   */
  private toApiData(data: Partial<ProductModel>): Partial<ProductApiResponse> {
    const apiData: Partial<ProductApiResponse> = {};

    if (data.name !== undefined) apiData.name = data.name;
    if (data.price !== undefined) apiData.price = data.price;
    if (data.description !== undefined) apiData.description = data.description;
    if (data.image !== undefined) apiData.imageUrl = data.image;
    if (data.categoryId !== undefined) apiData.categoryId = data.categoryId;
    if (data.stockQuantity !== undefined) apiData.stockQuantity = data.stockQuantity;
    if (data.isActive !== undefined) apiData.active = data.isActive;

    return apiData;
  }
}

// Export singleton instance
export const productRepository = new ProductRepository(); 