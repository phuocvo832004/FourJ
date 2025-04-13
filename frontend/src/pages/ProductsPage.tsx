import React, { useState } from 'react';
import { Product } from '../types';
import ProductCard from '../components/common/ProductCard';
import product1Image from '../assets/product-1.jpg';

const ProductsPage: React.FC = () => {
  // Mock data - replace with API call
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Product 1',
      price: 99.99,
      description: 'Product 1 description',
      image: product1Image,
      category: 'Electronics'
    },
    {
      id: '2',
      name: 'Product 2',
      price: 149.99,
      description: 'Product 2 description',
      image: product1Image,
      category: 'Fashion'
    },
    // Add more products...
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      {/* Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Categories</h3>
            <div className="space-y-1">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2">Electronics</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2">Fashion</span>
              </label>
              {/* Add more categories */}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Price Range</h3>
            <div className="space-y-1">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2">Under $50</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2">$50 - $100</span>
              </label>
              {/* Add more price ranges */}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage; 