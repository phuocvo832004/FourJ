import product1Image from '../assets/product-1.jpg';
import { Product, Category } from '../types';
import { ApiProduct, ApiCategory, PageResponse } from '../types/api';
import apiClient from './apiClient';

// Fetch sản phẩm với phân trang
export const fetchProductsPaginated = async (page: number = 0, size: number = 10) => {
  try {
    const response = await apiClient.get<PageResponse<ApiProduct>>(`/products?page=${page}&size=${size}`);
    
    // Map API response to Product type
    const mappedProducts: Product[] = response.data.content.map((item: ApiProduct) => ({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.imageUrl || product1Image, // Use fallback image if none provided
      category: item.categoryName || 'Uncategorized',
      categoryId: item.categoryId
    }));
    
    return {
      products: mappedProducts,
      pagination: {
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.number,
        size: response.data.size,
        isFirst: response.data.first,
        isLast: response.data.last
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch sản phẩm theo ID
export const fetchProductById = async (id: string) => {
  try {
    const response = await apiClient.get<ApiProduct>(`/products/${id}`);
    const item = response.data;
    
    // Map API response to Product type
    const product: Product = {
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.imageUrl || product1Image,
      category: item.categoryName || 'Uncategorized',
      categoryId: item.categoryId
    };
    
    return product;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

// Fetch danh mục
export const fetchCategories = async () => {
  try {
    const response = await apiClient.get<ApiCategory[]>('/categories');
    
    // Map API response to Category type
    const categories: Category[] = response.data.map(item => ({
      id: item.id.toString(),
      name: item.name,
      image: item.imageUrl || ''
    }));
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}; 