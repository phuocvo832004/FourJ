import { useCallback } from 'react';
import {
  productApi,
  sellerProductApi,
  adminProductApi
} from '../api/productApi';
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  useInfiniteQuery
} from '@tanstack/react-query';
import { ApiProduct } from '../types/api';

// Các khóa query để sử dụng nhất quán trong ứng dụng
export const QUERY_KEYS = {
  publicProducts: 'publicProducts',
  publicProduct: 'publicProduct',
  categories: 'categories',
  sellerProducts: 'sellerProducts',
  sellerProduct: 'sellerProduct',
  adminProducts: 'adminProducts',
  adminProduct: 'adminProduct',
};

export const useProduct = () => {
  const queryClient = useQueryClient();

  // === PUBLIC PRODUCTS ===

  // Lấy danh sách sản phẩm với phân trang
  const usePublicProducts = (page = 0, size = 10) => {
    return useQuery({
      queryKey: [QUERY_KEYS.publicProducts, { page, size }],
      queryFn: () => productApi.getAllPublicProducts({ page, size }),
    });
  };

  // Tối ưu: Sử dụng infinite query cho "load more" pattern
  const useInfinitePublicProducts = (size = 12) => {
    return useInfiniteQuery({
      queryKey: [QUERY_KEYS.publicProducts, 'infinite', size],
      queryFn: ({ pageParam = 0 }) => productApi.getAllPublicProducts({ page: pageParam, size }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        return lastPage.pagination.last ? undefined : lastPage.pagination.number + 1;
      },
    });
  };

  // Lấy chi tiết sản phẩm bằng ID
  const usePublicProductById = (id: string | undefined) => {
    return useQuery({
      queryKey: [QUERY_KEYS.publicProduct, id],
      queryFn: () => {
        if (!id) throw new Error('Product ID is required');
        return productApi.getPublicProductById(id);
      },
      enabled: !!id,
    });
  };

  // Lấy danh sách categories
  const useCategories = () => {
    return useQuery({
      queryKey: [QUERY_KEYS.categories],
      queryFn: () => productApi.getAllCategories(),
      staleTime: 1000 * 60 * 60, // 1 giờ
    });
  };

  // === SELLER PRODUCTS ===

  // Lấy sản phẩm của người bán
  const useSellerProducts = (page = 0, size = 10) => {
    return useQuery({
      queryKey: [QUERY_KEYS.sellerProducts, { page, size }],
      queryFn: () => sellerProductApi.getMySellerProducts({ page, size }),
    });
  };

  // Lấy chi tiết sản phẩm của người bán
  const useSellerProductById = (id: string | undefined) => {
    return useQuery({
      queryKey: [QUERY_KEYS.sellerProduct, id],
      queryFn: () => {
        if (!id) throw new Error('Product ID is required');
        return sellerProductApi.getSellerProductById(id);
      },
      enabled: !!id,
    });
  };

  // Tạo sản phẩm mới (người bán)
  const useCreateSellerProduct = () => {
    return useMutation({
      mutationFn: (productData: Omit<ApiProduct, 'id'>) => 
        sellerProductApi.createSellerProduct(productData),
      onSuccess: () => {
        // Vô hiệu hóa cache danh sách sản phẩm của người bán
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sellerProducts] });
      },
    });
  };

  // Cập nhật sản phẩm (người bán)
  const useUpdateSellerProduct = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string, data: Partial<ApiProduct> }) => 
        sellerProductApi.updateSellerProduct(id, data),
      onSuccess: (_, variables) => {
        // Vô hiệu hóa cache của sản phẩm đã cập nhật
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sellerProduct, variables.id] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sellerProducts] });
      },
    });
  };

  // Xóa sản phẩm (người bán)
  const useDeleteSellerProduct = () => {
    return useMutation({
      mutationFn: (id: string) => sellerProductApi.deleteSellerProduct(id),
      onSuccess: () => {
        // Vô hiệu hóa cache danh sách sản phẩm
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sellerProducts] });
      },
    });
  };

  // === ADMIN PRODUCTS ===

  // Lấy danh sách tất cả sản phẩm (admin)
  const useAdminProducts = (page = 0, size = 10) => {
    return useQuery({
      queryKey: [QUERY_KEYS.adminProducts, { page, size }],
      queryFn: () => adminProductApi.getAllAdminProducts({ page, size }),
    });
  };

  // Kích hoạt/hủy kích hoạt sản phẩm
  const useToggleProductActivation = () => {
    return useMutation({
      mutationFn: ({ id, activate }: { id: string, activate: boolean }) => 
        activate ? adminProductApi.activateProduct(id) : adminProductApi.deactivateProduct(id),
      onSuccess: (_, variables) => {
        // Vô hiệu hóa cache của sản phẩm đã thay đổi
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminProduct, variables.id] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminProducts] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.publicProduct, variables.id] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.publicProducts] });
      },
    });
  };

  // === Helper methods cho truy cập nhanh ===

  // Prefetch sản phẩm để tăng tốc điều hướng
  const prefetchProduct = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.publicProduct, id],
      queryFn: () => productApi.getPublicProductById(id),
    });
  }, [queryClient]);

  // Xóa cache sản phẩm
  const invalidateProductsCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.publicProducts] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.publicProduct] });
  }, [queryClient]);

  // Trả về các hooks và helpers
  return {
    // Public hooks
    usePublicProducts,
    useInfinitePublicProducts,
    usePublicProductById,
    useCategories,
    
    // Seller hooks
    useSellerProducts,
    useSellerProductById,
    useCreateSellerProduct,
    useUpdateSellerProduct,
    useDeleteSellerProduct,
    
    // Admin hooks
    useAdminProducts,
    useToggleProductActivation,
    
    // Helper methods
    prefetchProduct,
    invalidateProductsCache,
  };
}; 