import React, { ReactNode } from 'react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: string;
    direction: 'up' | 'down';
  };
  color?: 'indigo' | 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  className?: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon,
  change,
  color = 'indigo',
  className = ''
}) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  const changeColorClasses = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-center">
        <div className="mr-3">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {change && (
            <div className="flex items-center mt-1">
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${changeColorClasses[change.direction]}`}>
                {change.direction === 'up' ? (
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {change.value}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {change.value}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStatCard; 