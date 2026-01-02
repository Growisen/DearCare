import React from 'react';

const ProfileSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-1 animate-pulse">
      <div className="max-w-[100%]">
        <div className="bg-white rounded-sm shadow-none overflow-hidden mb-4">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-24 h-8 bg-gray-200 rounded"></div>
                <div className="w-24 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          <div className="border-b">
            <div className="flex space-x-4 p-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-8 bg-gray-200 rounded w-24"></div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeletonLoader;