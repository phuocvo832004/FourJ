// Interface cho API Product
export interface ApiProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
  stockQuantity: number;
  active: boolean;
  attributes?: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Interface cho API Category
export interface ApiCategory {
  id: number;
  name: string;
  imageUrl?: string;
}

// Interface cho PageRequest trong Spring Boot
export interface PageRequest {
  page: number;
  size: number;
  sort: string[];
}

// Interface cho PageResponse để map với cấu trúc phân trang của Spring Boot
export interface PageResponse<T> {
  content: T[];
  pageable: PageRequest;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
} 