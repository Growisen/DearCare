import React, { useState, useEffect } from 'react';
import { StaffSalary } from '@/types/staffSalary.types';
import { formatName } from '@/utils/formatters';
import { useSalaryConfig } from '@/hooks/useSalaryConfig'
import { formatDateToDDMMYYYY } from '@/utils/dateUtils';
import { saveSalaryPaymentWithConfig } from '@/app/actions/payroll/salary-actions';

interface SalaryCalculation {
  hourlyRate: number;
  shouldUpdateConfig: boolean;
}

interface SalaryCalculatorProps {
  employee: StaffSalary;
  isOpen: boolean;
  onClose: () => void;
  onSalaryUpdate: (id: number, newSalary: number) => void;
  dateFrom?: string;
  dateTo?: string;
}

const parseTimeToDecimalHours = (timeString: string | number): number => {
  if (typeof timeString === 'number') {
    return timeString;
  }
  
  if (!timeString || typeof timeString !== 'string') {
    return 0;
  }
  
  const hoursMatch = timeString.match(/(\d+)hrs?/i);
  const minutesMatch = timeString.match(/(\d+)min?/i);
  
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  
  return hours + (minutes / 60);
};

const formatDecimalHours = (decimalHours: number): string => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  if (minutes === 0) {
    return `${hours} hours`;
  }
  
  return `${hours} hours ${minutes} minutes`;
};

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  employee,
  isOpen,
  onClose,
  onSalaryUpdate,
  dateFrom,
  dateTo,
}) => {
  const { configId, hourlyRate, loading, error } = useSalaryConfig(employee?.id);
  const [isUpdating, setIsUpdating] = useState(false);

  const [salaryCalc, setSalaryCalc] = useState<SalaryCalculation>({
    hourlyRate: 0,
    shouldUpdateConfig: false,
  });

  useEffect(() => {
    if (employee && isOpen && !loading) {
      const decimalHours = parseTimeToDecimalHours(employee.hours);
      const calculatedRate = hourlyRate ?? (decimalHours > 0 ? Math.round(Number(employee.salary) / decimalHours) : 0);
      setSalaryCalc({
        hourlyRate: calculatedRate,
        shouldUpdateConfig: false,
      });
    }
  }, [employee, isOpen, hourlyRate, loading]);

  const calculateTotalSalary = (): number => {
    const decimalHours = parseTimeToDecimalHours(employee.hours);
    const hourlyPay = salaryCalc.hourlyRate * decimalHours;
    const total = hourlyPay;
    return Math.max(0, total);
  };

  const handleSalaryUpdate = async () => {
    if (employee && onSalaryUpdate) {
      setIsUpdating(true);
      
      try {
        const decimalHours = parseTimeToDecimalHours(employee.hours);

        const result = await saveSalaryPaymentWithConfig({
          nurseId: employee.id,
          payPeriodStart: dateFrom ?? '',
          payPeriodEnd: dateTo ?? '',
          hourlyRate: salaryCalc.hourlyRate,
          hoursWorked: decimalHours,
          currentConfigId: configId,
          shouldUpdateConfig: salaryCalc.shouldUpdateConfig || salaryCalc.hourlyRate !== hourlyRate,
          basePay: 0,
          allowance: 0,
          bonus: 0,
          deductions: 0,
          paymentStatus: 'pending',
          notes: `Salary payment for ${employee.name} (${employee.regNo})`,
        });
        
        onSalaryUpdate(employee.id, result.grossSalary);
        onClose();
      } catch (err) {
        console.error('Failed to save salary payment:', err);
        // Keep modal open on error so user can retry
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded shadow-lg p-6 min-w-[400px] max-w-[600px] max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Salary Calculator</h2>
        
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h3 className="font-medium text-gray-700">{formatName(employee.name ?? '')}</h3>
          <p className="text-sm text-gray-600">Reg No: {employee.regNo}</p>
          <p className="text-sm text-gray-600">
            Hours Worked: {typeof employee.hours === 'string' ? employee.hours : formatDecimalHours(parseTimeToDecimalHours(employee.hours))} 
            <span className="text-gray-500 ml-1">({parseTimeToDecimalHours(employee.hours).toFixed(2)} decimal hours)</span>
          </p>
          <p className="text-sm text-gray-600">Current Salary: ₹{employee.salary.toLocaleString()}</p>
          {(dateFrom || dateTo) && (
            <p className="text-sm text-gray-700 mt-2">
              Salary calculated for: <span className="font-semibold">{dateFrom ? formatDateToDDMMYYYY(dateFrom) : 'N/A'}</span> to <span className="font-semibold">{dateTo ? formatDateToDDMMYYYY(dateTo) : 'N/A'}</span>
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm font-medium">Error loading salary configuration</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading salary configuration...</span>
            </div>
            
            {/* Skeleton placeholders for form fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Main Form Content */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (₹)
                </label>
                <input
                  type="number"
                  value={salaryCalc.hourlyRate}
                  onChange={(e) => {
                    const newRate = Number(e.target.value);
                    setSalaryCalc({
                      ...salaryCalc, 
                      hourlyRate: newRate,
                      shouldUpdateConfig: newRate !== hourlyRate
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  min="0"
                  step="0.01"
                  disabled={loading || isUpdating}
                />
                {salaryCalc.shouldUpdateConfig && (
                  <p className="text-xs text-blue-600 mt-1">
                    ℹ️ This will update the employee&apos;s hourly rate configuration
                  </p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Salary Update</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {salaryCalc.shouldUpdateConfig 
                      ? "The hourly rate will be saved to the employee's salary configuration for future use."
                      : "Using existing hourly rate data. Change the rate above to update it."
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Calculation Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hourly Pay (₹{salaryCalc.hourlyRate} × {parseTimeToDecimalHours(employee.hours).toFixed(2)} hrs):</span>
                  <span className="text-gray-700">₹{(salaryCalc.hourlyRate * parseTimeToDecimalHours(employee.hours)).toLocaleString()}</span>
                </div>
                <div className="border-t text-gray-800 pt-2 flex justify-between font-semibold">
                  <span>Total Salary:</span>
                  <span>₹{calculateTotalSalary().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Loading Overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-700 font-medium">Saving salary payment...</p>
              <p className="text-gray-500 text-sm mt-1">Please wait</p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={handleSalaryUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={loading || !!error || isUpdating}
          >
            {(loading || isUpdating) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isUpdating ? 'Saving...' : 'Update Salary'}
          </button>
        </div>
      </div>
    </div>
  );
};