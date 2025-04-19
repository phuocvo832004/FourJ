import { useState, useCallback } from 'react';
import { Product, Category } from '../types';
import product1Image from '../assets/product-1.jpg';

interface ApiProduct {
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

interface ApiCategory {
  id: number;
  name: string;
  imageUrl?: string;
}

// Định nghĩa interface cho PageRequest trong Spring Boot
interface PageRequest {
  page: number;
  size: number;
  sort: string[];
}

// Thêm interface PageResponse để map với cấu trúc phân trang của Spring Boot
interface PageResponse<T> {
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

export const useProductHooks = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dùng đường dẫn tương đối để proxy sẽ chuyển tiếp
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      let data: PageResponse<ApiProduct>;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      if (!data.content) {
        console.error('Invalid data format:', data);
        throw new Error('Server returned data in unexpected format');
      }
      
      // Map API response to Product type
      const mappedProducts: Product[] = data.content.map((item: ApiProduct) => ({
        id: item.id.toString(),
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.imageUrl || product1Image, // Use fallback image if none provided
        category: item.categoryName || 'Uncategorized',
        categoryId: item.categoryId
      }));
      
      setProducts(mappedProducts);
      setError(null);
      
      return mappedProducts;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      
      // Fallback to mock data for development
      const mockProducts = [
        {
          id: '1',
          name: 'iPhone 14 Pro Max',
          price: 28990000,
          description: 'Điện thoại cao cấp với màn hình 6.7 inch',
          image: product1Image,
          category: 'Điện thoại',
          categoryId: 1
        },
        {
          id: '2',
          name: 'MacBook Pro M2',
          price: 35990000,
          description: 'Laptop mạnh mẽ với chip M2',
          image: product1Image,
          category: 'Laptop',
          categoryId: 2
        },
        {
          id: '3',
          name: 'Apple Watch Series 8',
          price: 10990000,
          description: 'Đồng hồ thông minh với nhiều tính năng sức khỏe',
          image: product1Image,
          category: 'Đồng hồ thông minh',
          categoryId: 3
        },
        {
          id: '4',
          name: 'AirPods Pro 2',
          price: 6790000,
          description: 'Tai nghe không dây với khả năng chống ồn',
          image: product1Image,
          category: 'Phụ kiện',
          categoryId: 4
        },
      ];
      
      setProducts(mockProducts);
      return mockProducts;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductsPaginated = useCallback(async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/products?page=${page}&size=${size}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      let data: PageResponse<ApiProduct>;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      if (!data.content) {
        console.error('Invalid data format:', data);
        throw new Error('Server returned data in unexpected format');
      }
      
      // Map API response to Product type
      const mappedProducts: Product[] = data.content.map((item: ApiProduct) => ({
        id: item.id.toString(),
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.imageUrl || product1Image,
        category: item.categoryName || 'Uncategorized',
        categoryId: item.categoryId
      }));
      
      
      return {
        products: mappedProducts,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.number,
        isLastPage: data.last
      };
    } catch (err) {
      console.error('Error fetching paginated products:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      
      // Fallback to mock data for development
      const mockProducts = [
        {
          id: `${page*size + 1}`,
          name: `Sản phẩm ${page*size + 1}`,
          price: 28990000,
          description: 'Sản phẩm mẫu',
          image: product1Image,
          category: 'Điện thoại',
          categoryId: 1
        },
        {
          id: `${page*size + 2}`,
          name: `Sản phẩm ${page*size + 2}`,
          price: 35990000,
          description: 'Sản phẩm mẫu',
          image: product1Image,
          category: 'Laptop',
          categoryId: 2
        }
      ];
      
      
      return {
        products: mockProducts,
        totalElements: 100,
        totalPages: 50,
        currentPage: page,
        isLastPage: page >= 49
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dùng đường dẫn tương đối để proxy sẽ chuyển tiếp
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map API response to Category type
      const mappedCategories: Category[] = data.map((item: ApiCategory) => ({
        id: item.id.toString(),
        name: item.name,
        image: item.imageUrl || ''
      }));
      
      setCategories(mappedCategories);
      return mappedCategories;
    } catch (err) {
      console.error('Error fetching categories:', err);
      
      // Nếu không lấy được categories từ API, thử tạo từ sản phẩm
      if (products.length > 0) {
        const extractedCategories = extractCategoriesFromProducts(products);
        setCategories(extractedCategories);
        return extractedCategories;
      }
      
      // Nếu không có sản phẩm, thử lấy sản phẩm trước
      try {
        const fetchedProducts = await fetchProducts();
        const extractedCategories = extractCategoriesFromProducts(fetchedProducts);
        setCategories(extractedCategories);
        return extractedCategories;
      } catch (e) {
        console.error('Error fetching products for categories:', e);
        
        // Fallback to mock data nếu không lấy được cả sản phẩm
        const mockCategories = [
          { id: '1', name: 'Điện thoại', image: '' },
          { id: '2', name: 'Laptop', image: '' },
          { id: '3', name: 'Phụ kiện', image: '' },
          { id: '4', name: 'Đồng hồ thông minh', image: '' },
        ];
        
        setCategories(mockCategories);
        return mockCategories;
      }
    } finally {
      setLoading(false);
    }
  }, [products, fetchProducts]);

//   const getFeaturedProducts = useCallback(async () => {
//     try {
//       setLoading(true);
      
//       // Tạo mock data cho featured products
//       // Có thể dựa vào products đã có hoặc tạo dữ liệu mới
//       if (products.length > 0) {
//         // Chọn ngẫu nhiên 4 sản phẩm từ danh sách hiện có
//         const shuffled = [...products].sort(() => 0.5 - Math.random());
//         const featured = shuffled.slice(0, 4);
        
//         // Thêm thuộc tính đặc biệt cho sản phẩm nổi bật 
//         return featured.map((product, index) => ({
//           ...product,
//           isNew: index === 0 || index === 3,
//           discountPercentage: index === 1 ? 15 : (index === 2 ? 10 : undefined)
//         }));
//       } else {
//         // Mock data nếu chưa có sản phẩm
//         return [
//           {
//             id: '1',
//             name: 'iPhone 14 Pro Max',
//             price: 28990000,
//             description: 'Điện thoại cao cấp với màn hình 6.7 inch',
//             image: product1Image,
//             category: 'Điện thoại',
//             isNew: true
//           },
//           {
//             id: '2',
//             name: 'MacBook Pro M2',
//             price: 35990000,
//             description: 'Laptop mạnh mẽ với chip M2',
//             image: product1Image,
//             category: 'Laptop',
//             discountPercentage: 15
//           },
//           {
//             id: '3',
//             name: 'Apple Watch Series 8',
//             price: 10990000,
//             description: 'Đồng hồ thông minh với nhiều tính năng sức khỏe',
//             image: product1Image,
//             category: 'Đồng hồ thông minh',
//             discountPercentage: 10
//           },
//           {
//             id: '4',
//             name: 'AirPods Pro 2',
//             price: 6790000,
//             description: 'Tai nghe không dây với khả năng chống ồn',
//             image: product1Image,
//             category: 'Phụ kiện',
//             isNew: true
//           }
//         ];
//       }
//     } catch (err) {
//       console.error('Error in getFeaturedProducts:', err);
      
//       // Tạo mock data trong trường hợp lỗi
//       return [
//         {
//           id: '1',
//           name: 'iPhone 14 Pro Max',
//           price: 28990000,
//           description: 'Điện thoại cao cấp với màn hình 6.7 inch',
//           image: product1Image,
//           category: 'Điện thoại',
//           isNew: true
//         },
//         {
//           id: '2',
//           name: 'MacBook Pro M2',
//           price: 35990000,
//           description: 'Laptop mạnh mẽ với chip M2',
//           image: product1Image,
//           category: 'Laptop',
//           discountPercentage: 15
//         }
//       ];
//     } finally {
//       setLoading(false);
//     }
//   }, [products]);

  const getProductById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // Chuyển đổi id sang kiểu số để phù hợp với backend (id là Long)
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error('ID sản phẩm không hợp lệ');
      }
      
      // Dùng đường dẫn tương đối để proxy sẽ chuyển tiếp
      const response = await fetch(`/api/products/${numericId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product details: ${response.status}`);
      }
      
      const item: ApiProduct = await response.json();
      
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
    } catch (err) {
      console.error(`Error fetching product with id ${id}:`, err);
      
      // Return the product from the existing products list if available
      const existingProduct = products.find(p => p.id === id);
      
      if (existingProduct) {
        return existingProduct;
      }
      
      // Nếu không tìm thấy sản phẩm, gọi API lấy tất cả sản phẩm
      if (products.length === 0) {
        await fetchProducts();
        const product = products.find(p => p.id === id);
        if (product) return product;
      }
      
      // Nếu vẫn không tìm thấy, trả về thông báo lỗi
      setError('Không thể tải thông tin sản phẩm. Sản phẩm có thể không tồn tại.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [products, fetchProducts]);

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    //getFeaturedProducts,
    getProductById,
    fetchProductsPaginated
  };
}; 