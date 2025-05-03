// src/types/search.ts
import { ProductDocument } from './product'; // Import ProductDocument

// ---- Search Service DTOs ----

// DTO cho kết quả tìm kiếm (Trả về từ các API search)
// Cần khớp với cấu trúc Elasticsearch response wrapper (nếu có)
export interface SearchResult {
  // Thông tin phân trang (tùy thuộc wrapper)
  totalHits: number; // Tổng số kết quả khớp
  // page?: number; // Trang hiện tại (nếu backend trả về)
  // size?: number; // Kích thước trang (nếu backend trả về)
  from?: number; // Vị trí bắt đầu (thường dùng trong ES)
  // totalPages?: number; // Có thể tính toán ở frontend

  // Danh sách sản phẩm
  products: ProductDocument[];

  // Thông tin bổ sung
  suggestedTerms?: string[]; // Gợi ý sửa lỗi chính tả
  facets?: Record<string, FacetEntry[]>; // Kết quả aggregation (facets)
  searchTime?: string; // Thời gian thực hiện tìm kiếm (ms)
}

// DTO cho một Facet Entry (trong aggregations)
export interface FacetEntry {
  key: string; // Giá trị của facet (ví dụ: "Red", "Category A")
  count: number; // Số lượng document khớp với giá trị này
}

// DTO cho tham số tìm kiếm phức tạp (POST /api/search/products)
// Khớp với cấu trúc query của Elasticsearch hoặc DTO backend
export interface SearchParams {
  query?: string; // Từ khóa tìm kiếm chính
  categories?: number[]; // Filter theo category ID
  sellerIds?: string[]; // Filter theo seller ID
  brand?: string; // Filter theo brand
  priceRange?: { // Filter theo khoảng giá
    min?: number;
    max?: number;
  };
  attributes?: Record<string, string[]>; // Filter theo thuộc tính { "Color": ["Red"], "Size": ["M", "L"] }
  // Các filter khác...

  sortOption?: 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST' | 'BEST_SELLING' | 'HIGHEST_RATED'; // Tùy chọn sắp xếp

  // Phân trang (thường dùng from/size cho ES)
  from?: number; // Bắt đầu từ vị trí nào (page * size)
  size?: number; // Số lượng kết quả mỗi trang

  includeAggregations?: boolean; // Có yêu cầu trả về facets không?
  // Các tùy chọn ES khác nếu cần (highlighting, etc.)
}

// DTO cho tham số tìm kiếm đơn giản (GET /api/search/products, /category/{id}, /filter)
// Thường là các query param trên URL
export interface SimpleSearchParams {
  keyword?: string; // Từ khóa (cho GET /search/products)
  page?: number; // Trang (thường frontend tính toán 'from')
  size?: number; // Kích thước trang

  // Params cho filter (GET /search/products/filter)
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: string; // Ví dụ: "1,2,3"
  attributes?: string; // Ví dụ: "Color:Red,Size:M" (cần quy ước format)

  // Params cho sắp xếp
  sortBy?: 'price' | 'createdAt' | 'name' | 'rating' | 'soldCount'; // Các trường có thể sort
  sortDir?: 'asc' | 'desc';

  // Các params khác...
}

// DTO cho tham số filter (GET /api/search/products/filter)
// Có thể giống SimpleSearchParams hoặc tách riêng nếu cần
// export interface FilterParams extends SimpleSearchParams {
//   // Kế thừa hoặc định nghĩa lại các trường filter
// } 