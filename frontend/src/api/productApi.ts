import product1Image from '../assets/product-1.jpg';
import { Product, Category } from '../types';
import { ApiProduct, ApiCategory, PageResponse } from '../types/api';
import apiClient from './apiClient';

// --- Type Definitions (Kiểm tra/Bổ sung) ---
// Giả sử ApiProduct đã bao gồm stockQuantity, isActive, imageUrl, categoryId, categoryName
// interface ApiProduct { ... }
// interface ApiCategory { ... }

interface ProductQueryParams {
  page?: number;
  size?: number;
  sort?: string; // Ví dụ: 'price,asc' hoặc 'name,desc'
  // Thêm các query params khác nếu có (ví dụ: search, categoryId)
}

interface SellerProductQueryParams extends ProductQueryParams {
  // Params riêng cho seller search nếu có
  query?: string;
  categoryId?: string;
}

interface AdminProductQueryParams extends ProductQueryParams {
  // Params riêng cho admin search nếu có
  query?: string;
  categoryId?: string;
  sellerId?: string;
}

// --- API Endpoints ---
const productEndpoints = {
  // Public Products
  getAllPublicProducts: '/products',
  getPublicProductById: (id: string) => `/products/${id}`,
  getPublicProductsByCategory: (categoryId: string) => `/products/category/${categoryId}`, // Mới
  searchPublicProducts: '/products/search', // Mới

  // Public Categories
  getAllCategories: '/categories',
  getCategoryById: (id: string) => `/categories/${id}`,
  createCategory: '/categories', // Mới (Admin?)
  updateCategory: (id: string) => `/categories/${id}`, // Mới (Admin?)
  deleteCategory: (id: string) => `/categories/${id}`, // Mới (Admin?)

  // Seller Products
  createSellerProduct: '/products/seller',
  getMySellerProducts: '/products/seller/my-products', // Mới
  getSellerProductById: (id: string) => `/products/seller/${id}`, // Mới (trùng với endpoint public?)
  updateSellerProduct: (id: string) => `/products/seller/${id}`,
  deleteSellerProduct: (id: string) => `/products/seller/${id}`,
  searchSellerProducts: '/products/seller/search', // Mới
  getSellerProductsByCategory: (categoryId: string) => `/products/seller/category/${categoryId}`, // Mới

  // Admin Products
  createAdminProduct: '/products/admin',
  getAllAdminProducts: '/products/admin',
  getAdminProductById: (id: string) => `/products/admin/${id}`,
  updateAdminProduct: (id: string) => `/products/admin/${id}`,
  deleteAdminProduct: (id: string) => `/products/admin/${id}`,
  getAdminProductsBySeller: (sellerId: string) => `/products/admin/seller/${sellerId}`, // Mới
  getAdminProductsByCategory: (categoryId: string) => `/products/admin/category/${categoryId}`, // Mới
  searchAdminProducts: '/products/admin/search', // Mới
  activateProduct: (id: string) => `/products/admin/${id}/activate`, // Mới
  deactivateProduct: (id: string) => `/products/admin/${id}/deactivate`, // Mới
};


// --- Helper Function for Mapping ---
const mapApiProductToProduct = (item: ApiProduct): Product => ({
  id: item.id.toString(),
  name: item.name,
  price: item.price,
  description: item.description,
  image: item.imageUrl || product1Image,
  category: item.categoryName || 'Uncategorized',
  categoryId: item.categoryId,
  // Thêm các trường khác nếu cần: stockQuantity, isActive...
});

const mapApiCategoryToCategory = (item: ApiCategory): Category => ({
    id: item.id.toString(),
    name: item.name,
    image: item.imageUrl || '',
});

// --- Public API Functions ---
export const productApi = {
  // Public Products
  getAllPublicProducts: async (params: ProductQueryParams = {}) => {
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.getAllPublicProducts, { params });
    return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data // Trả về cả pagination info
    };
  },
  getPublicProductById: async (id: string) => {
    const response = await apiClient.get<ApiProduct>(productEndpoints.getPublicProductById(id));
    return mapApiProductToProduct(response.data);
  },
  getPublicProductsByCategory: async (categoryId: string, params: ProductQueryParams = {}) => { // Mới
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.getPublicProductsByCategory(categoryId), { params });
     return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data
    };
  },
  searchPublicProducts: async (params: ProductQueryParams = {}) => { // Mới
     // GET /api/products/search - Tìm kiếm sản phẩm (Public) - Params thế nào?
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.searchPublicProducts, { params });
     return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data
    };
  },

  // Public Categories
  getAllCategories: async () => {
    const response = await apiClient.get<ApiCategory[]>(productEndpoints.getAllCategories);
    return response.data.map(mapApiCategoryToCategory);
  },
  getCategoryById: async (id: string) => {
     const response = await apiClient.get<ApiCategory>(productEndpoints.getCategoryById(id));
    return mapApiCategoryToCategory(response.data);
  },
   // --- Admin Category Functions --- (API cho categories POST/PUT/DELETE)
  createCategory: async (categoryData: Omit<ApiCategory, 'id'>) => { // Mới
    return apiClient.post<ApiCategory>(productEndpoints.createCategory, categoryData);
  },
  updateCategory: async (id: string, categoryData: Partial<ApiCategory>) => { // Mới
    return apiClient.put<ApiCategory>(productEndpoints.updateCategory(id), categoryData);
  },
  deleteCategory: async (id: string) => { // Mới
    return apiClient.delete<void>(productEndpoints.deleteCategory(id));
  },
};


// --- Seller API Functions ---
export const sellerProductApi = {
  createSellerProduct: async (productData: Omit<ApiProduct, 'id'>) => {
    // POST /api/products/seller - Tạo sản phẩm mới (người bán)
    return apiClient.post<ApiProduct>(productEndpoints.createSellerProduct, productData);
  },
  getMySellerProducts: async (params: SellerProductQueryParams = {}) => { // Mới
    // GET /api/products/seller/my-products - Lấy danh sách sản phẩm của người bán
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.getMySellerProducts, { params });
     return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data
    };
  },
  getSellerProductById: async (id: string) => { // Mới
    // GET /api/products/seller/{id} - Lấy thông tin sản phẩm theo ID
    const response = await apiClient.get<ApiProduct>(productEndpoints.getSellerProductById(id));
    return mapApiProductToProduct(response.data);
  },
  updateSellerProduct: async (id: string, productData: Partial<ApiProduct>) => {
    // PUT /api/products/seller/{id} - Cập nhật thông tin sản phẩm
    return apiClient.put<ApiProduct>(productEndpoints.updateSellerProduct(id), productData);
  },
  deleteSellerProduct: async (id: string) => {
    // DELETE /api/products/seller/{id} - Xóa sản phẩm
    return apiClient.delete<void>(productEndpoints.deleteSellerProduct(id));
  },
  searchSellerProducts: async (params: SellerProductQueryParams = {}) => { // Mới
    // GET /api/products/seller/search - Tìm kiếm sản phẩm của người bán
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.searchSellerProducts, { params });
     return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data
    };
  },
  getSellerProductsByCategory: async (categoryId: string, params: SellerProductQueryParams = {}) => { // Mới
    // GET /api/products/seller/category/{categoryId} - Lấy sản phẩm theo danh mục
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.getSellerProductsByCategory(categoryId), { params });
     return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data
    };
  },
};


// --- Admin API Functions ---
export const adminProductApi = {
  createAdminProduct: async (productData: Omit<ApiProduct, 'id'>) => { // Mới
    // POST /api/products/admin - Tạo sản phẩm mới (admin)
    return apiClient.post<ApiProduct>(productEndpoints.createAdminProduct, productData);
  },
  getAllAdminProducts: async (params: AdminProductQueryParams = {}) => { // Mới
    // GET /api/products/admin - Lấy danh sách sản phẩm
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.getAllAdminProducts, { params });
     return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data
    };
  },
  getAdminProductById: async (id: string) => { // Mới
    // GET /api/products/admin/{id} - Lấy thông tin sản phẩm theo ID
    const response = await apiClient.get<ApiProduct>(productEndpoints.getAdminProductById(id));
    return mapApiProductToProduct(response.data);
  },
  updateAdminProduct: async (id: string, productData: Partial<ApiProduct>) => { // Mới
    // PUT /api/products/admin/{id} - Cập nhật thông tin sản phẩm
    return apiClient.put<ApiProduct>(productEndpoints.updateAdminProduct(id), productData);
  },
  deleteAdminProduct: async (id: string) => { // Mới
    // DELETE /api/products/admin/{id} - Xóa sản phẩm
    return apiClient.delete<void>(productEndpoints.deleteAdminProduct(id));
  },
  getAdminProductsBySeller: async (sellerId: string, params: AdminProductQueryParams = {}) => { // Mới
    // GET /api/products/admin/seller/{sellerId} - Lấy sản phẩm theo người bán
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.getAdminProductsBySeller(sellerId), { params });
     return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data
    };
  },
  getAdminProductsByCategory: async (categoryId: string, params: AdminProductQueryParams = {}) => { // Mới
    // GET /api/products/admin/category/{categoryId} - Lấy sản phẩm theo danh mục
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.getAdminProductsByCategory(categoryId), { params });
     return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data
    };
  },
  searchAdminProducts: async (params: AdminProductQueryParams = {}) => { // Mới
    // GET /api/products/admin/search - Tìm kiếm sản phẩm
    const response = await apiClient.get<PageResponse<ApiProduct>>(productEndpoints.searchAdminProducts, { params });
     return {
      products: response.data.content.map(mapApiProductToProduct),
      pagination: response.data
    };
  },
  activateProduct: async (id: string) => { // Mới
    // PUT /api/products/admin/{id}/activate - Kích hoạt sản phẩm
    return apiClient.put<void>(productEndpoints.activateProduct(id));
  },
  deactivateProduct: async (id: string) => { // Mới
    // PUT /api/products/admin/{id}/deactivate - Hủy kích hoạt sản phẩm
    return apiClient.put<void>(productEndpoints.deactivateProduct(id));
  },
};


// --- Xóa các export cũ không cần thiết ---
// export const fetchProductsPaginated = ...
// export const fetchProductById = ...
// export const fetchCategories = ... 