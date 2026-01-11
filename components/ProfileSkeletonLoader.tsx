import React from 'react';

const ProfileSkeletonLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="mx-auto">
        
        <div className="bg-white rounded-sm overflow-hidden mb-6 border border-gray-200">
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-sm flex-shrink-0 mx-auto md:mx-0 mb-4 md:mb-0"></div>
              
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="h-8 bg-gray-200 rounded-sm w-48 mx-auto md:mx-0"></div>
                <div className="h-4 bg-gray-200 rounded-sm w-64 mx-auto md:mx-0"></div>
                <div className="flex justify-center md:justify-start space-x-2 mt-2">
                   <div className="h-5 bg-gray-200 rounded-sm w-16"></div>
                   <div className="h-5 bg-gray-200 rounded-sm w-16"></div>
                </div>
              </div>

              <div className="flex space-x-3 mt-4 md:mt-0 justify-center">
                <div className="w-32 h-10 bg-gray-200 rounded-sm"></div>
                <div className="w-12 h-10 bg-gray-200 rounded-sm"></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 px-8 py-3 border-b border-gray-100">
            <div className="flex space-x-8 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex flex-col space-y-2">
                    <div className="h-5 bg-gray-200 rounded-sm w-20"></div>
                    {item === 1 && <div className="h-1 bg-gray-300 rounded-sm w-full mt-1"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm p-8 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-3">
                <div className="h-3 bg-gray-200 rounded-sm w-20"></div>
                <div className="h-5 bg-gray-200 rounded-sm w-full"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-sm p-6 border border-gray-200 flex flex-col h-96">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-gray-200 rounded-sm"></div>
                <div className="w-6 h-6 bg-gray-200 rounded-sm"></div>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="h-6 bg-gray-200 rounded-sm w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-sm w-full"></div>
                <div className="h-4 bg-gray-200 rounded-sm w-full"></div>
                <div className="h-4 bg-gray-200 rounded-sm w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded-sm w-4/6"></div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-4">
                 <div className="h-4 bg-gray-200 rounded-sm w-20"></div>
                 <div className="h-10 bg-gray-200 rounded-sm w-28"></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProfileSkeletonLoader;