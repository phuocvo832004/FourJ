import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, category }) => {
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, price, image, category, description: '', quantity: 1 });
  };
  
  return (
    <motion.div whileHover={{ y: -5 }}>
      <Card className="overflow-hidden h-full" padding="none">
        <Link to={`/product/${id}`} className="block h-full">
          <div className="relative">
            <img
              src={image}
              alt={name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
              {category}
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">{name}</h3>
            <p className="text-gray-600 mb-4">${price.toFixed(2)}</p>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
};

export default ProductCard; 