import React, { useState } from 'react';
import { StaffSalary } from '@/types/staffSalary.types';
import { formatDate, formatName } from '@/utils/formatters';

interface SalaryTableProps {
  data: StaffSalary[];
  onSalaryUpdate?: (id: number, newSalary: number) => void;
}

interface SalaryCalculation {
  hourlyRate: number;
  regularHours: number;
  overtimeHours: number;
  overtimeMultiplier: number;
  bonus: number;
  deductions: number;
}

export const SalaryTable: React.FC<SalaryTableProps> = ({ data, onSalaryUpdate }) => {
  const [selectedRow, setSelectedRow] = useState<StaffSalary | null>(null);
  const [calculatorRow, setCalculatorRow] = useState<StaffSalary | null>(null);
  const [salaryCalc, setSalaryCalc] = useState<SalaryCalculation>({
    hourlyRate: 0,
    regularHours: 0,
    overtimeHours: 0,
    overtimeMultiplier: 1.5,
    bonus: 0,
    deductions: 0,
  });

  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleFlagClick = (row: StaffSalary) => {
    if (row.missingFields && row.missingFields.length > 0) {
      setSelectedRow(row);
    }
  };

  const handleSalaryClick = (row: StaffSalary) => {
    // Only allow salary calculation for rows without missing fields (green checkmark)
    if (!row.missingFields || row.missingFields.length === 0) {
      setCalculatorRow(row);
      // Initialize with current data
      setSalaryCalc({
        hourlyRate: Math.round(Number(row.salary) / (Number(row.hours) || 1)),
        regularHours: Number(row.hours) || 0,
        overtimeHours: 0,
        overtimeMultiplier: 1.5,
        bonus: 0,
        deductions: 0,
      });
    }
  };

  const calculateTotalSalary = (): number => {
    const regularPay = salaryCalc.hourlyRate * salaryCalc.regularHours;
    const overtimePay = salaryCalc.hourlyRate * salaryCalc.overtimeHours * salaryCalc.overtimeMultiplier;
    const total = regularPay + overtimePay + salaryCalc.bonus - salaryCalc.deductions;
    return Math.max(0, total);
  };

  const handleSalaryUpdate = () => {
    console.log(calculatorRow)
    if (calculatorRow && onSalaryUpdate) {
      const newSalary = calculateTotalSalary();
      onSalaryUpdate(calculatorRow.id, newSalary);
    }
    closeCalculator();
  };

  const closeOverlay = () => setSelectedRow(null);
  const closeCalculator = () => setCalculatorRow(null);

  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr className="text-left">
            <th className="py-4 px-6 font-medium text-gray-700">Name</th>
            <th className="py-4 px-6 font-medium text-gray-700">Reg No</th>
            <th className="py-4 px-6 font-medium text-gray-700">Hours Worked</th>
            <th className="py-4 px-6 font-medium text-gray-700">Salary</th>
            <th className="py-4 px-6 font-medium text-gray-700">Flag</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="py-4 px-6 text-gray-800 font-medium">{formatName(row.name ?? '')}</td>
              <td className="py-4 px-6 text-gray-600">{row.regNo}</td>
              <td className="py-4 px-6 text-gray-600">{row.hours}</td>
              <td className="py-4 px-6 text-gray-800 font-semibold">
                {(!row.missingFields || row.missingFields.length === 0) ? (
                  <button
                    onClick={() => handleSalaryClick(row)}
                    className="text-left hover:text-blue-600 cursor-pointer underline-offset-2 hover:underline"
                    title="Click to calculate salary"
                  >
                    ₹{row.salary.toLocaleString()}
                  </button>
                ) : (
                  <span>₹{row.salary.toLocaleString()}</span>
                )}
              </td>
              <td className="py-4 px-6 text-red-500 text-lg">
                {row.missingFields && row.missingFields.length > 0 ? (
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleFlagClick(row)}
                    title="Show missing fields"
                  >
                    🚩
                  </span>
                ) : (
                  '✅'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Existing Missing Fields Overlay */}
      {selectedRow && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={closeOverlay}
        >
          <div
            className="bg-white rounded shadow-lg p-6 min-w-[300px] max-h-[80vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2 text-red-600">Missing Data</h2>
            <p className="mb-2 text-gray-700">Before proceeding, add the following missing data:</p>
            {/* Group missing fields by date */}
            <div className="mb-4">
              {Object.entries(
                selectedRow.missingFields
                  ? selectedRow.missingFields.reduce((acc, curr) => {
                      acc[curr.date] = acc[curr.date] || [];
                      acc[curr.date].push(curr.field);
                      return acc;
                    }, {} as Record<string, string[]>)
                  : {}
              ).map(([date, fields]) => (
                <div key={date} className="mb-2 flex items-center">
                  <span className="font-semibold text-gray-700 mr-2">{formatDate(date)}:</span>
                  <span className="text-gray-700">[{fields.map((field, idx) => (
                    <span key={idx}>
                      {formatFieldName(field)}{idx < fields.length - 1 ? ', ' : ''}
                    </span>
                  ))}]</span>
                </div>
              ))}
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={closeOverlay}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* New Salary Calculator Overlay */}
      {calculatorRow && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={closeCalculator}
        >
          <div
            className="bg-white rounded shadow-lg p-6 min-w-[400px] max-w-[600px] max-h-[80vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}
          >
            
            <div className="mb-4 p-3 bg-gray-100 rounded">
              <h3 className="font-medium text-gray-700">{formatName(calculatorRow.name ?? '')}</h3>
              <p className="text-sm text-gray-600">Reg No: {calculatorRow.regNo}</p>
              <p className="text-sm text-gray-600">Current Salary: ₹{calculatorRow.salary.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={salaryCalc.hourlyRate}
                    onChange={(e) => setSalaryCalc({...salaryCalc, hourlyRate: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regular Hours
                  </label>
                  <input
                    type="number"
                    value={salaryCalc.regularHours}
                    onChange={(e) => setSalaryCalc({...salaryCalc, regularHours: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime Hours
                  </label>
                  <input
                    type="number"
                    value={salaryCalc.overtimeHours}
                    onChange={(e) => setSalaryCalc({...salaryCalc, overtimeHours: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime Multiplier
                  </label>
                  <input
                    type="number"
                    value={salaryCalc.overtimeMultiplier}
                    onChange={(e) => setSalaryCalc({...salaryCalc, overtimeMultiplier: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
                    min="1"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus (₹)
                  </label>
                  <input
                    type="number"
                    value={salaryCalc.bonus}
                    onChange={(e) => setSalaryCalc({...salaryCalc, bonus: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deductions (₹)
                  </label>
                  <input
                    type="number"
                    value={salaryCalc.deductions}
                    onChange={(e) => setSalaryCalc({...salaryCalc, deductions: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700"
                    min="0"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Calculation Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular Pay:</span>
                    <span className='text-gray-700'>₹{(salaryCalc.hourlyRate * salaryCalc.regularHours).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overtime Pay:</span>
                    <span className='text-gray-700'>₹{(salaryCalc.hourlyRate * salaryCalc.overtimeHours * salaryCalc.overtimeMultiplier).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bonus:</span>
                    <span className='text-gray-700'>₹{salaryCalc.bonus.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deductions:</span>
                    <span className="text-red-600">-₹{salaryCalc.deductions.toLocaleString()}</span>
                  </div>
                  <div className="border-t text-gray-800 pt-2 flex justify-between font-semibold">
                    <span>Total Salary:</span>
                    <span>₹{calculateTotalSalary().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeCalculator}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSalaryUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Salary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};