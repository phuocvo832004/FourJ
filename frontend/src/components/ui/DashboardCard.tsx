import React, { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  className = '',
  children,
  footer
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden seller-card ${className}`}>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-blue-500">{icon}</div>}
          <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6 bg-white">{children}</div>
      {footer && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default DashboardCard; 