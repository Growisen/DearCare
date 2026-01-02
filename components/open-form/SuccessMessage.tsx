import React from 'react';

export const SuccessMessage = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-sm animate-in fade-in zoom-in-95 duration-300">
      <div className="p-10 sm:p-12 text-center flex flex-col items-center">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-green-50 border border-green-100 mb-6">
          <svg 
            className="h-6 w-6 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 mb-3">
          Registration Complete
        </h2>
        <p className="text-gray-500 mb-2 max-w-sm mx-auto">
          The client profile has been successfully created in the system.
        </p>
        <p className="text-gray-500 mb-2 max-w-sm mx-auto">
          Our team will contact you shortly.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          You can now close this window.
        </p>
      </div>
    </div>
  );
};