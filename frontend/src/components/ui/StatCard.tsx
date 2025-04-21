import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  trend?: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  trend,
  color = 'blue',
  className = '',
}) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };

  const iconBg = colors[color];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 seller-stat-card ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <p className={`ml-2 text-sm font-medium ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {change.isPositive ? '+' : ''}{change.value}
              </p>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-md ${iconBg}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          {trend}
        </div>
      )}
    </div>
  );
};

export default StatCard; 