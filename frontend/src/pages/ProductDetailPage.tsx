import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import product1Image from '../assets/product-1.jpg';
import { useCart } from '../hooks/useCart';

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
  stock: number;
  isActive: boolean;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdDate: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    userName: ''
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        
        const data = await response.json();
        setProduct(data);
        
        // Also fetch reviews
        fetchProductReviews();
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Could not load product details. Please try again later.');
        
        // Use mock data for development
        setProduct({
          id: Number(id),
          name: 'Premium Product',
          price: 199.99,
          description: 'This is a detailed description of the product. It includes all the important features and specifications that customers need to know.',
          category: {
            id: 1,
            name: 'Electronics'
          },
          stock: 10,
          isActive: true
        });
        
        setReviews([
          {
            id: 1,
            userName: 'Nguyen Van A',
            rating: 5,
            comment: 'Sản phẩm rất tốt, đúng như mô tả!',
            createdDate: '2023-06-15'
          },
          {
            id: 2,
            userName: 'Tran Thi B',
            rating: 4,
            comment: 'Chất lượng tốt, giao hàng nhanh.',
            createdDate: '2023-06-10'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    const fetchProductReviews = async () => {
      try {
        const response = await fetch(`/api/products/${id}/reviews`);
        
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (err) {
        console.error('Error fetching product reviews:', err);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.imageUrl || product1Image,
      category: product.category?.name || 'Uncategorized',
      quantity
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewData.userName.trim() || !reviewData.comment.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: reviewData.userName,
          rating: reviewData.rating,
          comment: reviewData.comment
        }),
      });
      
      if (response.ok) {
        const newReview = await response.json();
        setReviews(prev => [...prev, newReview]);
        setReviewData({ rating: 5, comment: '', userName: '' });
        setShowReviewForm(false);
      } else {
        alert('Không thể gửi đánh giá. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      // For development, simulate a successful review submission
      const mockNewReview = {
        id: reviews.length + 1,
        userName: reviewData.userName,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdDate: new Date().toISOString().split('T')[0]
      };
      
      setReviews(prev => [...prev, mockNewReview]);
      setReviewData({ rating: 5, comment: '', userName: '' });
      setShowReviewForm(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
        {error || 'Không tìm thấy sản phẩm'}
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

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Create specs object from product properties
  const specs = {
    'Danh mục': product.category?.name || 'Uncategorized',
    'Kho hàng': product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng',
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
          
          {/* Rating display */}
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({reviews.length} đánh giá)
            </span>
          </div>
          
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
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} sản phẩm có sẵn` : 'Hết hàng'}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button 
            className={`w-full py-3 rounded-lg text-lg font-semibold transition-colors ${
              product.stock > 0 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-400 cursor-not-allowed text-white'
            }`}
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
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

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
          <button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showReviewForm ? 'Đóng' : 'Viết đánh giá'}
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-4">Đánh giá của bạn</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên của bạn
                </label>
                <input
                  type="text"
                  value={reviewData.userName}
                  onChange={(e) => setReviewData({...reviewData, userName: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đánh giá
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setReviewData({...reviewData, rating: star})}
                      className="focus:outline-none"
                    >
                      <svg 
                        className={`w-8 h-8 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhận xét của bạn
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  className="w-full p-2 border rounded-md h-32"
                  required
                />
              </div>
              
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Gửi đánh giá
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold">{review.userName}</h4>
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {review.createdDate}
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Chưa có đánh giá nào cho sản phẩm này</p>
            <button 
              onClick={() => setShowReviewForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Hãy là người đầu tiên đánh giá
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage; 