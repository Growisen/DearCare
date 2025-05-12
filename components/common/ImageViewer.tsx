import React from 'react';
import Image from 'next/image';

interface ImageViewerProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={handleContentClick}
      >
        <button
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-xl z-50"
          onClick={onClose}
          aria-label="Close image viewer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="relative w-full h-auto overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={1200}
            className="object-contain w-full h-full"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;