import React from 'react';
import { dutyPeriodOptions } from '../../utils/constants';

interface DutyPeriodSelectorProps {
  dutyPeriod: string;
  dutyPeriodReason: string;
  formErrors: {
    [key: string]: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (id: string) => void;
}

export function DutyPeriodSelector({
  dutyPeriod,
  dutyPeriodReason,
  formErrors,
  handleInputChange,
  handleBlur,
}: DutyPeriodSelectorProps) {
  const showReasonField = dutyPeriod === 'above_3_months';
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="dutyPeriod" className="block text-sm font-medium text-gray-700 mb-1">
          Duty Period <span className="text-red-500">*</span>
        </label>
        <select
          id="dutyPeriod"
          value={dutyPeriod}
          onChange={handleInputChange}
          onBlur={() => handleBlur('dutyPeriod')}
          className={`w-full rounded-lg border ${
            formErrors.dutyPeriod ? 'border-red-500' : 'border-gray-200'
          } py-3 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10`}
        >
          {dutyPeriodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {formErrors.dutyPeriod && (
          <p className="mt-1 text-xs text-red-500">{formErrors.dutyPeriod}</p>
        )}
      </div>

      {showReasonField && (
        <div>
          <label htmlFor="dutyPeriodReason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Extended Duration <span className="text-red-500">*</span>
          </label>
          <textarea
            id="dutyPeriodReason"
            value={dutyPeriodReason}
            onChange={handleInputChange}
            onBlur={() => handleBlur('dutyPeriodReason')}
            className={`w-full rounded-lg border ${
              formErrors.dutyPeriodReason ? 'border-red-500' : 'border-gray-200'
            } py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20`}
            placeholder="Please explain why you need care for more than 3 months"
          ></textarea>
          {formErrors.dutyPeriodReason && (
            <p className="mt-1 text-xs text-red-500">{formErrors.dutyPeriodReason}</p>
          )}
        </div>
      )}
    </div>
  );
}