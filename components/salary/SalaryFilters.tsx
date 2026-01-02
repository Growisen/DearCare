import React from 'react';

interface SalaryFiltersProps {
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

export const SalaryFilters: React.FC<SalaryFiltersProps> = ({
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
    <div className="p-4 bg-gray-50 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Category:</span>
          <div className="flex gap-1.5 items-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-slate-200"
                }`}
              >
                {category === "all" ? "All Categories" : category}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={onDateFromChange}
            className="rounded-sm border border-slate-200 bg-white py-1.5 px-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-xs font-medium text-gray-600">To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={onDateToChange}
            className="rounded-sm border border-slate-200 bg-white py-1.5 px-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={onCalculate}
          className="ml-auto px-3 py-1.5 bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
        >
          Calculate Salary
        </button>
        <button
          onClick={onResetFilters}
          className="px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-slate-200"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};