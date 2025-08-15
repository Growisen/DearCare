"use client"

import React, { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const NotFoundPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Main Container */}
        <div className="bg-white rounded border border-gray-300 p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">
            404
          </h1>

          {/* Error Message */}
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>

          <p className="text-gray-600 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable. Please check the URL and try again.
          </p>
        </div>

        {/* Error Details Section (for development) */}
        {mounted && (
          <div className="mt-6 bg-white rounded border border-gray-300 p-4">
            <details className="text-sm">
              <summary className="font-medium text-gray-800 cursor-pointer hover:text-gray-600 transition-colors">
                Technical Details
              </summary>
              <div className="mt-3 pt-3 border-t border-gray-200 text-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Error Code:</span> 404 - Not Found
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span> {new Date().toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Request URL:</span> {window.location.href}
                  </div>
                  <div>
                    <span className="font-medium">User Agent:</span> {window.navigator.userAgent.substring(0, 50) + '...'}
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;