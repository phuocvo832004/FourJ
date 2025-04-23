import { useState, useCallback, useRef } from 'react';
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

  // Cache lưu trữ các sản phẩm đã fetch trước đó
  const productsCache = useRef<Map<string, Product>>(new Map());
  // Cache cho các kết quả phân trang
  const paginationCache = useRef<Map<string, {products: Product[], pagination: typeof pagination}>>(new Map());
  // Lưu trữ trạng thái request hiện tại để tránh fetch trùng lặp
  const pendingRequests = useRef<Map<string, Promise<unknown>>>(new Map());

  // Helper function để trích xuất danh mục từ sản phẩm
  const extractCategoriesFromProducts = useCallback((productsList: Product[]): Category[] => {
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
  }, []);

  const getProducts = useCallback(async () => {
    const cacheKey = 'all_products';
    
    // Nếu đã có request đang pending, trả về kết quả từ request đó
    if (pendingRequests.current.has(cacheKey)) {
      return pendingRequests.current.get(cacheKey);
    }
    
    // Kiểm tra cache trước khi gọi API
    if (paginationCache.current.has(cacheKey)) {
      const cachedData = paginationCache.current.get(cacheKey);
      if (cachedData) {
        setProducts(cachedData.products);
        setPagination(cachedData.pagination);
        return cachedData.products;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Tạo promise và lưu vào pendingRequests
      const fetchPromise = fetchProductsPaginated().then(result => {
        setProducts(result.products);
        setPagination(result.pagination);
        
        // Cập nhật cache
        paginationCache.current.set(cacheKey, {
          products: result.products,
          pagination: result.pagination
        });
        
        // Lưu từng sản phẩm vào cache
        result.products.forEach(product => {
          productsCache.current.set(product.id, product);
        });
        
        // Extract categories nếu cần
        const extractedCategories = extractCategoriesFromProducts(result.products);
        setCategories(extractedCategories);
        
        // Xóa khỏi pending requests khi hoàn thành
        pendingRequests.current.delete(cacheKey);
        
        return result.products;
      }).catch(err => {
        console.error('Error in getProducts:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        setProducts([]);
        
        // Xóa khỏi pending requests khi có lỗi
        pendingRequests.current.delete(cacheKey);
        
        throw err;
      }).finally(() => {
        setLoading(false);
      });
      
      // Lưu promise vào pendingRequests
      pendingRequests.current.set(cacheKey, fetchPromise);
      return fetchPromise;
    } catch (err) {
      console.error('Error in getProducts:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
      throw err;
    }
  }, [extractCategoriesFromProducts]);

  const getProductsPaginated = useCallback(async (page: number = 0, size: number = 10) => {
    const cacheKey = `products_page${page}_size${size}`;
    
    // Nếu đã có request đang pending, trả về kết quả từ request đó
    if (pendingRequests.current.has(cacheKey)) {
      return pendingRequests.current.get(cacheKey);
    }
    
    // Kiểm tra cache trước khi gọi API
    if (paginationCache.current.has(cacheKey)) {
      const cachedData = paginationCache.current.get(cacheKey);
      if (cachedData) {
        setProducts(cachedData.products);
        setPagination(cachedData.pagination);
        return cachedData;
      }
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Tạo promise và lưu vào pendingRequests
      const fetchPromise = fetchProductsPaginated(page, size).then(result => {
        setProducts(result.products);
        setPagination(result.pagination);
        
        // Cập nhật cache
        paginationCache.current.set(cacheKey, {
          products: result.products,
          pagination: result.pagination
        });
        
        // Lưu từng sản phẩm vào cache
        result.products.forEach(product => {
          productsCache.current.set(product.id, product);
        });
        
        // Xóa khỏi pending requests khi hoàn thành
        pendingRequests.current.delete(cacheKey);
        
        return result;
      }).catch(err => {
        console.error('Error in getProductsPaginated:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        setProducts([]);
        
        // Xóa khỏi pending requests khi có lỗi
        pendingRequests.current.delete(cacheKey);
        
        throw err;
      }).finally(() => {
        setLoading(false);
      });
      
      // Lưu promise vào pendingRequests
      pendingRequests.current.set(cacheKey, fetchPromise);
      return fetchPromise;
    } catch (err) {
      console.error('Error in getProductsPaginated:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
      throw err;
    }
  }, []);

  const getProductById = useCallback(async (id: string) => {
    const cacheKey = `product_${id}`;
    
    // Nếu đã có request đang pending, trả về kết quả từ request đó
    if (pendingRequests.current.has(cacheKey)) {
      return pendingRequests.current.get(cacheKey);
    }
    
    // Kiểm tra cache trước khi gọi API
    if (productsCache.current.has(id)) {
      return productsCache.current.get(id);
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Tạo promise và lưu vào pendingRequests
      const fetchPromise = fetchProductById(id).then(product => {
        // Lưu vào cache
        productsCache.current.set(id, product);
        
        // Xóa khỏi pending requests khi hoàn thành
        pendingRequests.current.delete(cacheKey);
        
        return product;
      }).catch(err => {
        console.error(`Error in getProductById for id ${id}:`, err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
        
        // Xóa khỏi pending requests khi có lỗi
        pendingRequests.current.delete(cacheKey);
        
        throw err;
      }).finally(() => {
        setLoading(false);
      });
      
      // Lưu promise vào pendingRequests
      pendingRequests.current.set(cacheKey, fetchPromise);
      return fetchPromise;
    } catch (err) {
      console.error(`Error in getProductById for id ${id}:`, err);
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      throw err;
    }
  }, []);

  const getCategories = useCallback(async () => {
    const cacheKey = 'all_categories';
    
    // Nếu đã có request đang pending, trả về kết quả từ request đó
    if (pendingRequests.current.has(cacheKey)) {
      return pendingRequests.current.get(cacheKey);
    }
    
    // Nếu đã có categories và không rỗng, trả về
    if (categories.length > 0) {
      return categories;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Tạo promise và lưu vào pendingRequests
      const fetchPromise = fetchCategories().then(categoriesData => {
        setCategories(categoriesData);
        
        // Xóa khỏi pending requests khi hoàn thành
        pendingRequests.current.delete(cacheKey);
        
        return categoriesData;
      }).catch(err => {
        console.error('Error in getCategories:', err);
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
        
        // Nếu products đã được load, extract categories từ chúng
        if (products.length > 0) {
          const extractedCategories = extractCategoriesFromProducts(products);
          setCategories(extractedCategories);
          
          // Xóa khỏi pending requests khi có lỗi
          pendingRequests.current.delete(cacheKey);
          
          return extractedCategories;
        }
        
        setCategories([]);
        
        // Xóa khỏi pending requests khi có lỗi
        pendingRequests.current.delete(cacheKey);
        
        throw err;
      }).finally(() => {
        setLoading(false);
      });
      
      // Lưu promise vào pendingRequests
      pendingRequests.current.set(cacheKey, fetchPromise);
      return fetchPromise;
    } catch (err) {
      console.error('Error in getCategories:', err);
      setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      
      // Nếu products đã được load, extract categories từ chúng
      if (products.length > 0) {
        const extractedCategories = extractCategoriesFromProducts(products);
        setCategories(extractedCategories);
        return extractedCategories;
      }
      
      setCategories([]);
      throw err;
    }
  }, [categories, extractCategoriesFromProducts, products]);

  // Hàm xóa cache khi cần thiết
  const clearCache = useCallback(() => {
    productsCache.current.clear();
    paginationCache.current.clear();
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    pagination,
    getProducts,
    getProductsPaginated,
    getProductById,
    getCategories,
    clearCache
  };
}; 