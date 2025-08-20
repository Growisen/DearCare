"use client"

import React, { useState } from 'react';
import { StaffSalary } from '@/types/staffSalary.types';
import { formatDate, formatName } from '@/utils/formatters';
import { SalaryCalculator } from './SalaryCalculator';

interface SalaryTableProps {
  data: StaffSalary[];
  onSalaryUpdate?: (id: number, newSalary: number) => void;
  dateFrom?: string;
  dateTo?: string;
}

export const SalaryTable: React.FC<SalaryTableProps> = ({ data, onSalaryUpdate, dateFrom, dateTo }) => {
  const [selectedRow, setSelectedRow] = useState<StaffSalary | null>(null);
  const [calculatorRow, setCalculatorRow] = useState<StaffSalary | null>(null);
  const [salaryStatusRow, setSalaryStatusRow] = useState<StaffSalary | null>(null);

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
    }
  };

  const handleSalaryStatusClick = (row: StaffSalary) => {
    if (row.salaryStatus && row.salaryStatus !== 'none') {
      setSalaryStatusRow(row);
    }
  };

  const handleSalaryUpdate = (id: number, newSalary: number) => {
    if (onSalaryUpdate) {
      onSalaryUpdate(id, newSalary);
    }
    setCalculatorRow(null);
  };

  const getSalaryStatusDisplay = (row: StaffSalary) => {
    const status = row.salaryStatus || 'none';
    
    switch (status) {
      case 'full':
        return { icon: '✅', text: 'Fully Paid', color: 'text-green-600 bg-green-50' };
      case 'partial':
        return { icon: '⚠️', text: 'Partially Paid', color: 'text-orange-600 bg-orange-50' };
      case 'none':
      default:
        return { icon: '❌', text: 'Not Paid', color: 'text-red-600 bg-red-50' };
    }
  };

  const closeOverlay = () => setSelectedRow(null);
  const closeCalculator = () => setCalculatorRow(null);
  const closeSalaryStatus = () => setSalaryStatusRow(null);

  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr className="text-left">
            <th className="py-4 px-6 font-medium text-gray-700">Name</th>
            <th className="py-4 px-6 font-medium text-gray-700">Reg No</th>
            <th className="py-4 px-6 font-medium text-gray-700">Hours Worked</th>
            <th className="py-4 px-6 font-medium text-gray-700">Salary</th>
            <th className="py-4 px-6 font-medium text-gray-700">Payment Status</th>
            <th className="py-4 px-6 font-medium text-gray-700">Flag</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row) => {
            const statusDisplay = getSalaryStatusDisplay(row);
            return (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 text-gray-800 font-medium">{formatName(row.name ?? '')}</td>
                <td className="py-4 px-6 text-gray-600">{row.regNo}</td>
                <td className="py-4 px-6 text-gray-600">{row.hours}</td>
                <td className="py-4 px-6">
                  {(!row.missingFields || row.missingFields.length === 0) ? (
                    <button
                      onClick={() => handleSalaryClick(row)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                      title="Click to calculate salary"
                    >
                      {row.salaryCalculated ? "Update Salary" : "Calculate Salary"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed text-sm font-medium"
                      title="Missing fields required for calculation"
                    >
                      Calculate Salary
                    </button>
                  )}
                </td>
                <td className="py-4 px-6">
                  {row.salaryStatus && row.salaryStatus !== 'none' ? (
                    <button
                      onClick={() => handleSalaryStatusClick(row)}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${statusDisplay.color}`}
                      title="Click to view payment details"
                    >
                      <span className="mr-1">{statusDisplay.icon}</span>
                      {statusDisplay.text}
                    </button>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                      <span className="mr-1">{statusDisplay.icon}</span>
                      {statusDisplay.text}
                    </span>
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
            );
          })}
        </tbody>
      </table>
      
      {/* Missing Fields Overlay */}
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={closeOverlay}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Salary Status Details Overlay */}
      {salaryStatusRow && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeSalaryStatus}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-5 w-[380px] max-h-[75vh] overflow-y-auto relative border border-gray-200"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 text-black border-b border-gray-300 pb-2">
              Payment Details
            </h2>
            
            <div className="mb-4">
              <h3 className="font-semibold text-black mb-2">
                Employee: {formatName(salaryStatusRow.name ?? '')}
              </h3>
              <p className="text-xs text-gray-600 mb-4 font-medium">
                Period: {dateFrom ? formatDate(dateFrom) : 'N/A'} - {dateTo ? formatDate(dateTo) : 'N/A'}
              </p>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="font-semibold text-black mr-2 text-sm">Status:</span>
                  <span className={`px-3 py-1 rounded border text-xs font-semibold ${getSalaryStatusDisplay(salaryStatusRow).color}`}>
                    {getSalaryStatusDisplay(salaryStatusRow).icon} {getSalaryStatusDisplay(salaryStatusRow).text}
                  </span>
                </div>
              </div>

              {salaryStatusRow.paidPeriods && salaryStatusRow.paidPeriods.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-black mb-2 border-b border-gray-200 pb-1 text-sm">
                    Paid Periods:
                  </h4>
                  <div className="space-y-2">
                    {salaryStatusRow.paidPeriods.map((period, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-300 rounded p-2">
                        <div className="flex items-center text-xs">
                          <span className="text-black mr-2 font-bold">✓</span>
                          <span className="font-medium text-black">
                            {formatDate(period.start)} - {formatDate(period.end)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {salaryStatusRow.salaryStatus === 'partial' && (
                <div className="mt-4 p-3 bg-gray-100 border-l-3 border-black rounded">
                  <p className="text-xs text-black">
                    <strong>Note:</strong> Partial payment detected. Verify if additional payments are required.
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-300 pt-3 flex justify-end">
              <button
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors font-semibold text-sm"
                onClick={closeSalaryStatus}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {calculatorRow &&
        <SalaryCalculator
          employee={calculatorRow}
          isOpen={!!calculatorRow}
          onClose={closeCalculator}
          onSalaryUpdate={handleSalaryUpdate}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      }
    </div>
  );
};