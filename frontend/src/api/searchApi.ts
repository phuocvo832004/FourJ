import apiClient from './apiClient';

// Interface định nghĩa cấu trúc kết quả tìm kiếm từ search service
export interface SearchResult {
  totalHits: number;
  page: number;
  size: number;
  products: ProductDocument[];
  suggestedTerms?: string[];
  facets?: Record<string, FacetEntry[]>;
  searchTime: string;
}

export interface ProductDocument {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  attributes?: ProductAttribute[];
  inStock?: boolean;
  rating?: number;
  soldCount?: number;
  createdAt?: string;
  updatedAt?: string;
  active: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface FacetEntry {
  key: string;
  count: number;
}

// Interface định nghĩa tham số tìm kiếm
export interface SearchParams {
  query?: string;
  categories?: string[];
  brand?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  attributes?: Record<string, string[]>;
  sortOption?: 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST' | 'BEST_SELLING' | 'HIGHEST_RATED';
  page?: number;
  size?: number;
  includeAggregations?: boolean;
}

// Interface cho query params
interface SimpleSearchParams {
  keyword: string;
  page: number;
  size: number;
  sortDir: string;
  sortBy?: string;
  categories?: string[];
}

const searchApi = {
  // Tìm kiếm sản phẩm với nhiều tùy chọn
  searchProducts: async (params: SearchParams): Promise<SearchResult> => {
    const { page = 0, size = 20, ...restParams } = params;
    
    try {
      // POST method with complex search parameters - Sửa lại đúng endpoint
      const response = await apiClient.post('/search/products', {
        ...restParams,
        from: page * size,
        size: size,
        includeAggregations: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
  
  // API đơn giản để tìm kiếm bằng từ khóa (GET method - phù hợp cho header search)
  simpleSearch: async (
    keyword: string, 
    page: number = 0, 
    size: number = 10,
    categories?: string[],
    sortBy?: string,
    sortDir: 'asc' | 'desc' = 'asc'
  ): Promise<SearchResult> => {
    try {
      const params: SimpleSearchParams = {
        keyword,
        page,
        size,
        sortDir
      };
      
      if (sortBy) params.sortBy = sortBy;
      if (categories && categories.length) params.categories = categories;
      
      const response = await apiClient.get('/search/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error in simple search:', error);
      throw error;
    }
  },
  
  // Lấy gợi ý tìm kiếm
  getSuggestions: async (prefix: string, size: number = 5): Promise<string[]> => {
    try {
      if (!prefix || prefix.length < 2) {
        return [];
      }
      
      const response = await apiClient.get('/search/suggestions', {
        params: { prefix, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      // Ném lỗi để component gọi API có thể xử lý
      throw error;
    }
  },

  // Tìm kiếm sản phẩm theo khoảng giá
  searchByPriceRange: async (
    minPrice: number,
    maxPrice: number,
    keyword?: string,
    page: number = 0,
    size: number = 10
  ): Promise<SearchResult> => {
    try {
      const response = await apiClient.get('/search/products/price-range', {
        params: {
          keyword,
          minPrice,
          maxPrice,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching by price range:', error);
      throw error;
    }
  },

  // Tìm kiếm sản phẩm theo danh mục
  searchByCategory: async (
    categoryId: string,
    keyword?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'relevance',
    sortDir: 'asc' | 'desc' = 'asc'
  ): Promise<SearchResult> => {
    try {
      const response = await apiClient.get(`/search/products/category/${categoryId}`, {
        params: {
          keyword,
          page,
          size,
          sortBy,
          sortDir
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching by category:', error);
      throw error;
    }
  }
};

export default searchApi; 