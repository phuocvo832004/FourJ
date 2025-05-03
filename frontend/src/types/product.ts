// src/types/product.ts
// import { Category } from './index'; // Xóa import không dùng

// ---- Product Service DTOs ----

// Interface cho API Category (chuyển từ api.ts)
// GET /categories, GET /categories/{id}
export interface ApiCategory {
  id: number; // Backend dùng number
  name: string;
  imageUrl?: string;
  // parentId?: number; // Nếu có danh mục cha con
  // productCount?: number; // Nếu có số lượng sản phẩm
}

// DTO cho tạo/cập nhật Category (POST /categories, PUT /categories/{id})
export interface UpsertCategoryDto {
  name: string;
  imageUrl?: string; // Hoặc File?
  // parentId?: number;
}

// Interface cho API Product (chuyển từ api.ts và bổ sung)
// GET /products, GET /products/{id}, ...
export interface ApiProduct {
  id: number; // Backend dùng number
  name: string;
  description: string;
  price: number;
  stockQuantity: number; // Số lượng tồn kho
  isActive: boolean; // Trạng thái kinh doanh
  imageUrl?: string; // Ảnh đại diện
  imageUrls?: string[]; // Danh sách ảnh (nếu có)

  categoryId: number; // ID của category
  categoryName: string; // Tên category (có thể join từ backend)

  sellerId?: string; // ID của người bán (cho admin view?)
  sellerName?: string; // Tên người bán (cho admin view?)

  // Thuộc tính sản phẩm (ví dụ: màu sắc, kích thước)
  attributes?: Array<{
    id?: number; // ID của attribute value
    name: string; // Tên thuộc tính (e.g., "Color")
    value: string; // Giá trị thuộc tính (e.g., "Red")
  }>;

  rating?: number; // Điểm đánh giá trung bình
  reviewCount?: number; // Số lượng đánh giá
  soldCount?: number; // Số lượng đã bán

  createdAt?: string;
  updatedAt?: string;
}

// DTO cho tạo/cập nhật Product (POST/PUT /products/seller, POST/PUT /products/admin)
export interface UpsertProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive?: boolean; // Thường mặc định là true khi tạo?
  categoryId: number;
  imageUrl?: string; // Hoặc File?
  imageUrls?: string[]; // Hoặc File[]?
  attributes?: Array<{ name: string; value: string }>; // Gửi lên chỉ cần name/value?
}


// ---- Search Service DTOs ----

// DTO cho Product Document trong Elasticsearch
export interface ProductDocument {
  id: string; // Thường là string trong search index
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  imageUrl?: string;
  categoryId: number; // Giữ lại để filter
  categoryName: string;
  sellerId?: string; // Nếu cần filter/facet theo seller
  sellerName?: string;
  brand?: string; // Nếu có trường brand
  tags?: string[]; // Nếu có tags

  // Thuộc tính dạng key-value để dễ dàng facet/filter
  // Ví dụ: { "Color": "Red", "Size": "M" }
  // Hoặc dạng nested nếu phức tạp hơn
  attributes?: Record<string, string | string[]>;

  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  createdAt?: string; // Date trong Elasticsearch
  // Các trường khác được index...
} 