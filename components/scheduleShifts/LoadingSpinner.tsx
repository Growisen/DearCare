'use client';
import React from 'react';

function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="p-8 flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      <span className="ml-3 text-gray-600">{text}</span>
    </div>
  );
}

export default LoadingSpinner;