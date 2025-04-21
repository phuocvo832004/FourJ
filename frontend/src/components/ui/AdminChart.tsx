import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface AdminChartProps {
  data: ChartDataPoint[];
  title?: string;
  type: 'bar' | 'line';
  color?: string;
  height?: number;
  className?: string;
  showTooltip?: boolean;
  showGrid?: boolean;
}

const AdminChart: React.FC<AdminChartProps> = ({
  data,
  title,
  type = 'bar',
  color = '#4f46e5', // indigo-600
  height = 200,
  className = '',
  showTooltip = true,
  showGrid = true
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      {title && <h3 className="text-base font-medium text-gray-800 mb-4">{title}</h3>}
      
      <div style={{ height: `${height}px` }} className="w-full">
        {type === 'bar' ? (
          <div className="flex items-end space-x-2 h-full">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                <div className="relative w-full group cursor-pointer">
                  <div 
                    className="w-full rounded-t-sm transition-all duration-200 hover:opacity-90"
                    style={{ 
                      height: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: color
                    }}
                  ></div>
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none animate-fadeIn z-10">
                      {item.value}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">{item.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative h-full">
            {showGrid && (
              <div className="absolute inset-0 grid grid-rows-4 w-full h-full">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-gray-100 w-full"></div>
                ))}
              </div>
            )}
            <svg width="100%" height="100%" viewBox={`0 0 ${data.length * 50} 100`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Line */}
              <polyline
                points={data.map((item, i) => `${i * 50 + 25},${100 - (item.value / maxValue) * 80}`).join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Area beneath line */}
              <polygon
                points={`${25},100 ${data.map((item, i) => `${i * 50 + 25},${100 - (item.value / maxValue) * 80}`).join(' ')} ${(data.length - 1) * 50 + 25},100`}
                fill="url(#gradient)"
              />
              {/* Data points */}
              {data.map((item, i) => (
                <circle
                  key={i}
                  cx={i * 50 + 25}
                  cy={100 - (item.value / maxValue) * 80}
                  r="3"
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                  className="group cursor-pointer"
                />
              ))}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
              {data.map((item, index) => (
                <div key={index} className="text-xs text-gray-500 truncate">{item.label}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChart; 