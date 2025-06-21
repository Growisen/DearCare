import React from 'react';
import { StaffSalary } from '@/types/staffSalary.types';

interface SalaryTableProps {
  data: StaffSalary[];
}

export const SalaryTable: React.FC<SalaryTableProps> = ({ data }) => {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr className="text-left">
            <th className="py-4 px-6 font-medium text-gray-700">Name</th>
            <th className="py-4 px-6 font-medium text-gray-700">Reg No</th>
            <th className="py-4 px-6 font-medium text-gray-700">Hours Worked</th>
            <th className="py-4 px-6 font-medium text-gray-700">Salary</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="py-4 px-6 text-gray-800 font-medium">{row.name}</td>
              <td className="py-4 px-6 text-gray-600">{row.regNo}</td>
              <td className="py-4 px-6 text-gray-600">{row.hours}</td>
              <td className="py-4 px-6 text-gray-800 font-semibold">₹{row.salary.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};