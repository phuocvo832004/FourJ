import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import product1Image from '../assets/product-1.jpg';
import { useCart } from '../hooks/useCart';
import apiClient from '../api/apiClient';

// Interface cho API response có thể chứa stock_quantity
interface ApiProductResponse {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  // Thêm các trường cho danh mục theo đúng API
  category?: {
    id: number;
    name: string;
  };
  categoryId?: number;
  categoryName?: string;
  stock_quantity?: number;
  stockQuantity?: number;
  isActive: boolean;
}

// Interface chuẩn cho sản phẩm trong ứng dụng
interface ApiProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
  // Lưu giữ cả hai giá trị để xử lý linh hoạt
  categoryId?: number;
  categoryName?: string;
  stockQuantity: number;
  isActive: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoadingProduct(true);
      setProductError(null);
      
      try {
        const response = await apiClient.get<ApiProductResponse>(`/product/${id}`);
        
        // Chuyển đổi từ response format sang ApiProduct format
        const productData = response.data;
        
        // Xử lý danh mục - ưu tiên cấu trúc object category trước
        let categoryName = 'Uncategorized';
        let categoryId: number | undefined = undefined;
        
        // Trường hợp 1: API trả về object category
        if (productData.category && productData.category.name) {
          categoryName = productData.category.name;
          categoryId = productData.category.id;
        } 
        // Trường hợp 2: API trả về trường categoryName trực tiếp
        else if (productData.categoryName) {
          categoryName = productData.categoryName;
          categoryId = productData.categoryId;
        }
        
        const normalizedProduct: ApiProduct = {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          description: productData.description,
          imageUrl: productData.imageUrl,
          // Lưu trữ cả hai định dạng của danh mục để đảm bảo tương thích
          category: productData.category || (categoryId ? { id: categoryId, name: categoryName } : undefined),
          categoryId: categoryId || productData.categoryId,
          categoryName: categoryName,
          stockQuantity: productData.stockQuantity || productData.stock_quantity || 0,
          isActive: productData.isActive
        };
        
        console.log('Normalized product:', normalizedProduct);
        setProduct(normalizedProduct);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProductError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoadingProduct(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Sử dụng categoryName hoặc category.name - đảm bảo có giá trị
    const categoryDisplay = product.categoryName || product.category?.name || 'Uncategorized';
    
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.imageUrl || product1Image,
      category: categoryDisplay,
      quantity
    });
  };

  if (isLoadingProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
        {productError || 'Không tìm thấy sản phẩm'}
        <div className="mt-4">
          <button 
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Quay lại trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  // Sử dụng một hình ảnh đã import cho tất cả ảnh sản phẩm
  const productImages = product.imageUrl ? 
    [product.imageUrl, product.imageUrl, product.imageUrl] : 
    [product1Image, product1Image, product1Image];

  // Create specs object from product properties - sử dụng cả hai định dạng danh mục
  const specs = {
    'Danh mục': product.categoryName || product.category?.name || 'Uncategorized',
    'Kho hàng': product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sản phẩm` : 'Hết hàng',
    'Trạng thái': product.isActive ? 'Đang kinh doanh' : 'Ngừng kinh doanh',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={productImages[selectedImageIndex]}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="grid grid-cols-3 gap-4">
            {productImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={`w-full h-24 object-cover rounded-lg cursor-pointer ${selectedImageIndex === index ? 'border-2 border-blue-500' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          <p className="text-2xl font-bold text-blue-600">{product.price.toFixed(2)} VND</p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-700">Số lượng:</label>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                disabled={quantity >= product.stockQuantity}
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {product.stockQuantity > 0 ? `${product.stockQuantity} sản phẩm có sẵn` : 'Hết hàng'}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button 
            className={`w-full py-3 rounded-lg text-lg font-semibold transition-colors ${
              product.stockQuantity > 0 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-400 cursor-not-allowed text-white'
            }`}
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
          >
            {product.stockQuantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
          </button>

          {/* Specifications */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Thông số kỹ thuật</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-600">{key}:</span>
                  <span className="ml-2 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;