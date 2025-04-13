import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Category } from '../types';
import product1Image from '../assets/product-1.jpg';

const CategoriesPage: React.FC = () => {
  // Mock data - replace with API call
  const [categories] = useState<Category[]>([
    {
      id: '1',
      name: 'Electronics',
      image: product1Image,
    },
    {
      id: '2',
      name: 'Fashion',
      image: product1Image,
    },
    {
      id: '3',
      name: 'Home & Living',
      image: product1Image,
    },
    {
      id: '4',
      name: 'Sports',
      image: product1Image,
    },
    // Add more categories...
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.name.toLowerCase()}`}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative h-64 rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h2 className="text-white text-2xl font-semibold">
                  {category.name}
                </h2>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Featured Products by Category */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Featured Products by Category</h2>
        {categories.map((category) => (
          <div key={category.id} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <Link
                to={`/products?category=${category.name.toLowerCase()}`}
                className="text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Add ProductCard components here */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage; 