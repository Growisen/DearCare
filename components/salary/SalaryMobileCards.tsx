import React from 'react';
import { StaffSalary } from '@/types/staffSalary.types';

interface SalaryMobileCardsProps {
  data: StaffSalary[];
}

export const SalaryMobileCards: React.FC<SalaryMobileCardsProps> = ({ data }) => {
  return (
    <div className="sm:hidden bg-white">
      {data.map((row) => (
        <div key={row.id} className="p-5 space-y-2 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-0">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">{row.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Reg No: {row.regNo}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              ₹{row.salary.toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-sm bg-white border border-gray-200 p-3 rounded-lg">
            <p className="text-gray-500">Hours Worked:</p>
            <p className="text-gray-800 font-medium">{row.hours}</p>
          </div>
        </div>
      ))}
    </div>
  );
};