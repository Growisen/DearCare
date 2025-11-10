'use client';
import React from 'react';

interface StateDisplayProps {
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  children: React.ReactNode;
}

function StateDisplay({
  title,
  message,
  buttonText,
  onButtonClick,
  children,
}: StateDisplayProps) {
  return (
    <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <div className="mb-4">{children}</div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-500">{message}</p>
      <button
        onClick={onButtonClick}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {buttonText}
      </button>
    </div>
  );
}

export default StateDisplay;