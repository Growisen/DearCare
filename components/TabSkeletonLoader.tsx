import React from 'react';

interface TabSkeletonLoaderProps {
  tabCount?: number;
  contentRows?: number;
}

const TabSkeletonLoader: React.FC<TabSkeletonLoaderProps> = ({
  tabCount = 1,
  contentRows = 3
}) => {
  return (
    <div className="animate-pulse">
      <div className="border-b">
        <div className="flex space-x-4 p-4">
          {Array.from({ length: tabCount }).map((_, index) => (
            <div 
              key={index} 
              className="h-8 bg-gray-200 rounded w-24"
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {Array.from({ length: contentRows }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabSkeletonLoader;