import { useState, useCallback } from 'react';
import { Product, Category } from '../types';
import { 
  fetchProductsPaginated, 
  fetchProductById, 
  fetchCategories
} from '../api/productApi';

export const useProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10,
    isFirst: true,
    isLast: false
  });

  // Helper function để trích xuất danh mục từ sản phẩm
  const extractCategoriesFromProducts = (productsList: Product[]): Category[] => {
    const categoriesMap = new Map<number, Category>();
    
    productsList.forEach(product => {
      if (product.categoryId && product.category && !categoriesMap.has(product.categoryId)) {
        categoriesMap.set(product.categoryId, {
          id: product.categoryId.toString(),
          name: product.category,
          image: ''
        });
      }
    });
    
    return Array.from(categoriesMap.values());
  };

  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchProductsPaginated();
      setProducts(result.products);
      setPagination(result.pagination);
      
      // Extract categories if needed
      const extractedCategories = extractCategoriesFromProducts(result.products);
      setCategories(extractedCategories);
      
      return result.products;
    } catch (err) {
      console.error('Error in getProducts:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductsPaginated = useCallback(async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchProductsPaginated(page, size);
      setProducts(result.products);
      setPagination(result.pagination);
      
      return result;
    } catch (err) {
      console.error('Error in getProductsPaginated:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const product = await fetchProductById(id);
      return product;
    } catch (err) {
      console.error(`Error in getProductById for id ${id}:`, err);
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      
      return categoriesData;
    } catch (err) {
      console.error('Error in getCategories:', err);
      setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      
      // If products are loaded, extract categories from them
      if (products.length > 0) {
        const extractedCategories = extractCategoriesFromProducts(products);
        setCategories(extractedCategories);
        return extractedCategories;
      }
      
      setCategories([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [products]);

  return {
    products,
    categories,
    loading,
    error,
    pagination,
    getProducts,
    getProductsPaginated,
    getProductById,
    getCategories
  };
}; 