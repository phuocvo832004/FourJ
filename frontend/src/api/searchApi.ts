import apiClient from './apiClient';
// import { ProductDocument } from '../types/product'; // Tạm comment
// import { PageResponse } from '../types/api'; // Xóa import
// import { SearchResult, SearchParams, SimpleSearchParams, FacetEntry } from '../types/search';

// --- Type Definitions (Kiểm tra/Bổ sung) ---
type ProductDocument = unknown; // Thêm lại định nghĩa tạm thời
// export interface SearchResult { ... } // Đã có, cần kiểm tra lại trường
// export interface ProductDocument { ... } // Chuyển sang src/types/product.ts?
// export interface SearchParams { ... } // Đã có, kiểm tra lại trường
// export interface SimpleSearchParams { ... } // Đã có


// Endpoint mới cho search API
const searchEndpoints = {
  // SearchController (/api/search)
  searchProductsComplex: '/search/products',
  searchProductsSimple: '/search/products',
  getPriceRange: '/search/products/price-range',
  searchByCategory: (categoryId: string) => `/search/products/category/${categoryId}`,
  filterProducts: '/search/products/filter',
  getSuggestions: '/search/suggestions',

  // Các endpoint khác (có thể không cần ở frontend)
  getIndexStatus: '/search/index-status',
  recreateIndex: '/search/recreate-index',
  indexProduct: '/search/index-product',
  bulkIndexProducts: '/search/bulk-index-products',
  getSearchHealth: '/search/health',
  deleteProductIndex: (id: string) => `/search/product/${id}`,
};


const searchApi = {
  // POST /api/search/products - Tìm kiếm sản phẩm (với yêu cầu tùy chỉnh)
  searchProductsComplex: async (params: SearchParams): Promise<SearchResult> => {
    const { page, from = 0, size = 20, ...restParams } = params; // Giữ cả page và from
    const calculatedFrom = page !== undefined ? page * size : from; // Ưu tiên page nếu có
    const response = await apiClient.post(searchEndpoints.searchProductsComplex, {
      ...restParams,
      from: calculatedFrom,
      size: size,
      includeAggregations: params.includeAggregations ?? true,
    });
    return response.data;
  },

  // GET /api/search/products - Tìm kiếm sản phẩm theo truy vấn
  searchProductsSimple: async (
    keyword: string,
    page: number = 0,
    size: number = 10,
    params?: Omit<SimpleSearchParams, 'keyword' | 'page' | 'size'> // Thêm các params khác nếu cần
  ): Promise<SearchResult> => {
    const queryParams: SimpleSearchParams = {
      keyword,
      page,
      size,
      ...params, // Spread các params tùy chọn khác
    };
    const response = await apiClient.get(searchEndpoints.searchProductsSimple, { params: queryParams });
    return response.data;
  },

  // GET /api/search/products/price-range - Lấy khoảng giá sản phẩm
  getPriceRange: async (query?: string, categoryId?: string) => {
    const response = await apiClient.get<{ min: number, max: number }>(searchEndpoints.getPriceRange, { params: { query, categoryId }}); // Kiểu trả về chưa rõ
    return response.data;
  },

  // GET /api/search/products/category/{categoryId} - Tìm kiếm sản phẩm theo danh mục
  searchByCategory: async (
    categoryId: string,
    page: number = 0,
    size: number = 10,
    params?: Omit<SimpleSearchParams, 'categories' | 'page' | 'size'>
  ): Promise<SearchResult> => {
    const queryParams = { page, size, ...params };
    const response = await apiClient.get(searchEndpoints.searchByCategory(categoryId), { params: queryParams });
    return response.data;
  },

  // GET /api/search/products/filter - Lọc sản phẩm
  filterProducts: async (params: SimpleSearchParams): Promise<SearchResult> => {
    const response = await apiClient.get<SearchResult>(searchEndpoints.filterProducts, { params });
    return response.data;
  },

  // GET /api/search/suggestions - Lấy gợi ý tìm kiếm
  getSuggestions: async (prefix: string, size: number = 5): Promise<string[]> => {
    if (!prefix || prefix.length < 2) return [];
    const response = await apiClient.get<string[]>(searchEndpoints.getSuggestions, { params: { prefix, size } });
    return response.data;
  },

  // Các hàm quản lý index (có thể không cần ở frontend)
  // getIndexStatus: async () => {...},
  // recreateIndex: async () => {...},
  // ...
};

export default searchApi;

// --- Type Definitions --- (Kiểm tra lại với Backend)
export interface SearchResult { // Có thể cần PageResponse<ProductDocument>?
  totalHits: number;
  page: number; // Backend trả về page hay from/size?
  size: number;
  products: ProductDocument[]; // Dùng type tạm unknown
  suggestedTerms?: string[];
  facets?: Record<string, FacetEntry[]>; // Elasticsearch aggregations
  searchTime?: string; // Có trả về không?
}

// Chuyển ProductDocument sang src/types/product.ts
// export interface ProductDocument { ... }

export interface FacetEntry {
  key: string;
  count: number;
}

// Tham số tìm kiếm phức tạp (cho POST)
export interface SearchParams {
  query?: string;
  categories?: string[]; // category IDs or names?
  // brand?: string; // Có filter theo brand không?
  priceRange?: {
    min?: number;
    max?: number;
  };
  attributes?: Record<string, string[]>; // { "color": ["Red", "Blue"], "size": ["M"] }
  sortOption?: 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST' | 'BEST_SELLING' | 'HIGHEST_RATED';
  page?: number; // Dùng page hay from?
  from?: number; // Thêm trường from
  size?: number;
  includeAggregations?: boolean;
}

// Tham số tìm kiếm đơn giản (cho GET)
interface SimpleSearchParams {
  keyword: string;
  page: number;
  size: number;
  sortDir?: 'asc' | 'desc'; // Sửa lại từ boolean
  sortBy?: string; // "price", "name", "createdAt"?
  categories?: string[]; // category IDs or names?
  // Thêm các params đơn giản khác nếu có
}

export interface ProductAttribute {
  name: string;
  value: string;
} 