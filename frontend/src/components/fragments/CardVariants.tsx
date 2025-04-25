import React from 'react';
import { Card } from '../ui/Card';

// Card với header và footer
export const HeaderFooterCard: React.FC<{
  title: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, footer, children, className }) => (
  <Card className={className}>
    <Card.Header>
      <h3 className="text-lg font-semibold">{title}</h3>
    </Card.Header>
    <Card.Body>{children}</Card.Body>
    {footer && <Card.Footer>{footer}</Card.Footer>}
  </Card>
);

// Card thông tin
export const InfoCard: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, description, icon, className }) => (
  <Card className={`flex flex-col ${className || ''}`}>
    <Card.Body className="flex items-start space-x-4">
      {icon && <div className="text-blue-500">{icon}</div>}
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Card.Body>
  </Card>
);

// Card sản phẩm
export const ProductCard: React.FC<{
  name: string;
  price: number;
  image: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}> = ({ name, price, image, description, onClick, className }) => (
  <Card 
    className={`cursor-pointer hover:shadow-md transition ${className || ''}`}
    onClick={onClick}
  >
    <div className="relative pb-[75%]">
      <img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
      />
    </div>
    <Card.Body>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="font-bold text-red-600">
        {new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(price)}
      </p>
      {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
    </Card.Body>
  </Card>
);

// Card hành động
export const ActionCard: React.FC<{
  title: string;
  description?: string;
  actions: React.ReactNode;
  className?: string;
}> = ({ title, description, actions, className }) => (
  <Card className={className}>
    <Card.Body>
      <h3 className="font-semibold text-lg">{title}</h3>
      {description && <p className="text-gray-600 mt-1">{description}</p>}
    </Card.Body>
    <Card.Footer className="flex justify-end space-x-2">
      {actions}
    </Card.Footer>
  </Card>
);

// Card thống kê
export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}> = ({ label, value, icon, trend, className }) => (
  <Card className={`${className || ''}`}>
    <Card.Body className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <div className="flex items-center mt-1">
            <span
              className={`text-sm ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </span>
          </div>
        )}
      </div>
      {icon && <div className="text-blue-500 text-3xl">{icon}</div>}
    </Card.Body>
  </Card>
); 