import { BaseModel, ModelMapper } from './BaseModel';

export interface CategoryApiResponse {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  parentId?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Category Model - Lớp domain model cho danh mục sản phẩm
 */
export class CategoryModel extends BaseModel {
  name: string;
  image: string;
  description: string;
  parentId?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    name: string,
    isActive: boolean = true
  ) {
    super(id);
    this.name = name;
    this.image = '';
    this.description = '';
    this.isActive = isActive;
  }

  /**
   * Kiểm tra xem đây có phải là danh mục gốc hay không
   */
  isRoot(): boolean {
    return !this.parentId;
  }
}

/**
 * Mapper để chuyển đổi từ API response sang CategoryModel
 */
export const categoryMapper: ModelMapper<CategoryApiResponse, CategoryModel> = (apiData) => {
  const category = new CategoryModel(
    apiData.id,
    apiData.name,
    apiData.active !== undefined ? apiData.active : true
  );

  category.image = apiData.imageUrl || '';
  category.description = apiData.description || '';
  category.parentId = apiData.parentId;

  if (apiData.createdAt) {
    category.createdAt = new Date(apiData.createdAt);
  }

  if (apiData.updatedAt) {
    category.updatedAt = new Date(apiData.updatedAt);
  }

  return category;
}; 