import { useState, useCallback, useRef, useEffect } from 'react';
import { Product, Category } from '../types';
import { ApiProduct } from '../types/api';
import {
  productApi,
  sellerProductApi,
  adminProductApi
} from '../api/productApi';

interface PaginationInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  isFirst: boolean;
  isLast: boolean;
}

export const useProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const productsCache = useRef<Map<string, Product>>(new Map());
  const categoriesCache = useRef<Category[] | null>(null);
  const pendingRequests = useRef<Map<string, Promise<unknown>>>(new Map());

  const getPublicProducts = useCallback(async (page = 0, size = 10) => {
    const params = { page, size };
    const cacheKey = `public_products_page${page}_size${size}`;
    if (pendingRequests.current.has(cacheKey)) return pendingRequests.current.get(cacheKey);

    setLoading(true); setError(null);
    const promise = productApi.getAllPublicProducts(params)
      .then(result => {
        setProducts(result.products);
        setPagination({
            totalElements: result.pagination.totalElements,
            totalPages: result.pagination.totalPages,
            currentPage: result.pagination.number,
            size: result.pagination.size,
            isFirst: result.pagination.first,
            isLast: result.pagination.last
        });
        pendingRequests.current.delete(cacheKey);
        return result;
      })
      .catch(err => {
        console.error('Error in getPublicProducts:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        setProducts([]);
        throw err;
      })
      .finally(() => {
        setLoading(false);
        pendingRequests.current.delete(cacheKey);
      });
    pendingRequests.current.set(cacheKey, promise);
    return promise;
  }, []);

  const getPublicProductById = useCallback(async (id: string) => {
    const cacheKey = `product_${id}`;
    if (pendingRequests.current.has(cacheKey)) return pendingRequests.current.get(cacheKey);
    if (productsCache.current.has(id)) return productsCache.current.get(id);

    setLoading(true); setError(null);
    const promise = productApi.getPublicProductById(id)
      .then(product => {
        productsCache.current.set(id, product);
        pendingRequests.current.delete(cacheKey);
        return product;
      })
      .catch(err => {
        console.error(`Error in getPublicProductById for id ${id}:`, err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
        throw err;
      })
      .finally(() => {
        setLoading(false);
        pendingRequests.current.delete(cacheKey);
      });
    pendingRequests.current.set(cacheKey, promise);
    return promise;
  }, []);

  const getCategories = useCallback(async () => {
    const cacheKey = 'all_categories';
    if (pendingRequests.current.has(cacheKey)) return pendingRequests.current.get(cacheKey);
    if (categoriesCache.current) {
      setCategories(categoriesCache.current);
      return categoriesCache.current;
    }

    setLoading(true); setError(null);
    const promise = productApi.getAllCategories()
      .then(categoriesData => {
        setCategories(categoriesData);
        categoriesCache.current = categoriesData;
        pendingRequests.current.delete(cacheKey);
        return categoriesData;
      })
      .catch(err => {
        console.error('Error in getCategories:', err);
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
        setCategories([]);
        throw err;
      })
      .finally(() => {
        setLoading(false);
        pendingRequests.current.delete(cacheKey);
      });
    pendingRequests.current.set(cacheKey, promise);
    return promise;
  }, []);

  const getMySellerProducts = useCallback(async (page = 0, size = 10) => {
    const params = { page, size };
    const cacheKey = `seller_products_page${page}_size${size}`;
    if (pendingRequests.current.has(cacheKey)) return pendingRequests.current.get(cacheKey);

    setLoading(true); setError(null);
    try {
      const result = await sellerProductApi.getMySellerProducts(params);
      setProducts(result.products);
      setPagination({
          totalElements: result.pagination.totalElements,
          totalPages: result.pagination.totalPages,
          currentPage: result.pagination.number,
          size: result.pagination.size,
          isFirst: result.pagination.first,
          isLast: result.pagination.last
      });
      return result;
    } catch (err) {
      console.error('Error fetching seller products:', err);
      setError('Không thể tải sản phẩm của bạn.');
      throw err;
    } finally {
      setLoading(false);
      pendingRequests.current.delete(cacheKey);
    }
  }, []);

  const createSellerProduct = useCallback(async (productData: Omit<ApiProduct, 'id'>) => {
    setLoading(true); setError(null);
    try {
      const newProduct = await sellerProductApi.createSellerProduct(productData);
      return newProduct;
    } catch (err) {
      console.error('Error creating seller product:', err);
      setError('Không thể tạo sản phẩm.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllAdminProducts = useCallback(async (page = 0, size = 10) => {
    const params = { page, size };
    const cacheKey = `admin_products_page${page}_size${size}`;
    if (pendingRequests.current.has(cacheKey)) return pendingRequests.current.get(cacheKey);

    setLoading(true); setError(null);
    try {
      const result = await adminProductApi.getAllAdminProducts(params);
      setProducts(result.products);
      setPagination({
          totalElements: result.pagination.totalElements,
          totalPages: result.pagination.totalPages,
          currentPage: result.pagination.number,
          size: result.pagination.size,
          isFirst: result.pagination.first,
          isLast: result.pagination.last
      });
      return result;
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setError('Không thể tải danh sách sản phẩm.');
      throw err;
    } finally {
      setLoading(false);
      pendingRequests.current.delete(cacheKey);
    }
  }, []);

  const activateProduct = useCallback(async (id: string) => {
    setLoading(true); setError(null);
    try {
      await adminProductApi.activateProduct(id);
    } catch (err) {
      console.error('Error activating product:', err);
      setError('Không thể kích hoạt sản phẩm.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  return {
    products,
    categories,
    loading,
    error,
    pagination,
    getPublicProducts,
    getPublicProductById,
    getCategories,
    getMySellerProducts,
    createSellerProduct,
    getAllAdminProducts,
    activateProduct,
  };
}; 