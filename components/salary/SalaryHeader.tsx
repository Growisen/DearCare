import React from 'react';

interface SalaryHeaderProps {
  title: string;
  subtitle: string;
  categories: string[];
  selectedCategory: string;
  dateFrom: string;
  dateTo: string;
  onCategoryChange: (category: string) => void;
  onDateFromChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateToChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
  onResetFilters: () => void;
}

export const SalaryHeader: React.FC<SalaryHeaderProps> = ({
  title,
  subtitle,
  categories,
  selectedCategory,
  dateFrom,
  dateTo,
  onCategoryChange,
  onDateFromChange,
  onDateToChange,
  onCalculate,
  onResetFilters,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
        {/* Filters section */}
      <div className="p-4 bg-gray-50 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category section - now stacks better on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto mb-2 sm:mb-0">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Category:</span>
            <div className="flex flex-wrap gap-1.5 items-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {category === "all" ? "All Categories" : category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Date filters - now stack better on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto mb-2 sm:mb-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-600">From:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={onDateFromChange}
                max={new Date().toISOString().split('T')[0]} // Set max to current date
                className="rounded-md border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 flex-1 min-w-0"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-600">To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={onDateToChange}
                max={new Date().toISOString().split('T')[0]} // Set max to current date
                className="rounded-md border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 flex-1 min-w-0"
              />
            </div>
          </div>
          
          {/* Action buttons - better spacing on mobile */}          <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <button
              onClick={onCalculate}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 flex-1 sm:flex-none justify-center"
            >
              Calculate Working Hours
            </button>
            <button
              onClick={onResetFilters}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors border flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 flex-1 sm:flex-none justify-center"
            >
              Reset All
            </button>
          </div>        </div>
      </div>
    </div>
  );
};