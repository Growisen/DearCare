import React from 'react';

interface ClientCategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: 'DearCare' | 'TataLife') => void;
}

export const ClientCategorySelector = ({ selectedCategory, onCategoryChange }: ClientCategorySelectorProps) => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'DearCare', label: 'DearCare' },
          { id: 'TataLife', label: 'Tata Life' }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => onCategoryChange(type.id as 'DearCare' | 'TataLife')}
            className={`p-3 rounded-lg border ${
              selectedCategory === type.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-900 font-medium'
            } transition-colors duration-200`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};