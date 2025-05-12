"use client"

import { useState, useRef, useEffect } from 'react';
import { ClientCategory } from '@/types/client.types';

interface CategorySelectorProps {
  currentCategory: ClientCategory;
  onCategoryChange: (newCategory: ClientCategory) => Promise<void>;
  categories?: ClientCategory[];
}

const CategorySelector = ({ 
  currentCategory, 
  onCategoryChange, 
  categories = ['DearCare LLP', 'Tata HomeNursing'] 
}: CategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategoryChange = async (category: ClientCategory) => {
    if (category !== currentCategory) {
      try {
        setIsLoading(true);
        await onCategoryChange(category);
      } catch (error) {
        console.error('Failed to update category:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex" ref={dropdownRef}>
      <span className={`inline-flex items-center px-3 py-1 ${isOpen ? 'bg-blue-200' : 'bg-blue-100'} text-sm rounded text-blue-700 border ${isOpen ? 'border-blue-300' : 'border-blue-200'} group transition-colors`}>
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </span>
        ) : (
          <>
            {currentCategory}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Edit category"
              title="Edit category"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </>
        )}
      </span>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-white shadow-lg rounded-md border border-gray-200 z-10 overflow-hidden">
          <div className="py-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                disabled={isLoading}
                className={`
                  block w-full text-left px-4 py-2 text-sm transition-colors
                  ${currentCategory === category 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {category}
                {currentCategory === category && (
                  <span className="ml-2 text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;