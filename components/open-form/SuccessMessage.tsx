import React from 'react';
import { useRouter } from 'next/navigation';

interface SuccessMessageProps {
  onGoBack?: () => void;
}

export const SuccessMessage = ({ onGoBack }: SuccessMessageProps) => {
  const router = useRouter();
  
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
        <p className="text-md text-gray-600 mb-6">
          Thank you for requesting service from DearCare. Your information has been submitted successfully.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Our team will review your details and contact you shortly.
          You&apos;ll be redirected to the home page in a few seconds.
        </p>
        <button 
          onClick={handleGoBack}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};