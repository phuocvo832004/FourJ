import React, { ReactNode } from 'react';

interface AdminCardProps {
  title: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
}

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  icon,
  className = '',
  children,
  actions,
  footer,
  isLoading = false
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-indigo-500">{icon}</div>}
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      
      <div className="px-6 py-5 bg-white relative">
        {isLoading ? (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : null}
        {children}
      </div>
      
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default AdminCard; 