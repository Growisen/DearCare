import React, { useState, useEffect } from "react";

interface CreateSalaryModalProps {
  isOpen: boolean;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (startDate: string, endDate: string, includeAdvance: boolean, isAdvance: boolean) => void;
}

const CreateSalaryModal: React.FC<CreateSalaryModalProps> = ({
  isOpen,
  isCreating,
  onClose,
  onSubmit,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeAdvance, setIncludeAdvance] = useState(false);
  const [isAdvance, setIsAdvance] = useState(false);
  const [errors, setErrors] = useState({ startDate: "", endDate: "" });
  
  const today = new Date().toISOString().split('T')[0];
  const minYear = 2025;
  const maxYear = new Date().getFullYear();

  useEffect(() => {
    if (isOpen) {
      setStartDate("");
      setEndDate("");
      setIncludeAdvance(false);
      setIsAdvance(false);
      setErrors({ startDate: "", endDate: "" });
    }
  }, [isOpen]);

  useEffect(() => {
    setStartDate("");
    setEndDate("");
    setErrors({ startDate: "", endDate: "" });
  }, [includeAdvance]);
  
  useEffect(() => {
    const newErrors = { startDate: "", endDate: "" };

    if (startDate) {
      const startYear = new Date(startDate).getFullYear();
      if (startYear < minYear || startYear > maxYear) {
        newErrors.startDate = `Year must be between ${minYear} and ${maxYear}`;
      }

      if (includeAdvance && startDate < today) {
        newErrors.startDate = "Start date must be today or in the future for advance salary";
      }
    }

    if (endDate) {
      const endYear = new Date(endDate).getFullYear();
      if (endYear < minYear || endYear > maxYear) {
        newErrors.endDate = `Year must be between ${minYear} and ${maxYear}`;
      }

      if (includeAdvance && endDate < today) {
        newErrors.endDate = "End date must be today or in the future for advance salary";
      }
    }

    if (startDate && endDate && !newErrors.startDate && !newErrors.endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
  }, [startDate, endDate, includeAdvance, today]);
  
  const handleSubmit = () => {
    const newErrors = { startDate: "", endDate: "" };
    let isValid = true;

    if (!startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    } else {
      const startYear = new Date(startDate).getFullYear();
      if (startYear < minYear || startYear > maxYear) {
        newErrors.startDate = `Year must be between ${minYear} and ${maxYear}`;
        isValid = false;
      } else if (includeAdvance && startDate < today) {
        newErrors.startDate = "Start date must be today or in the future for advance salary";
        isValid = false;
      }
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    } else {
      const endYear = new Date(endDate).getFullYear();
      if (endYear < minYear || endYear > maxYear) {
        newErrors.endDate = `Year must be between ${minYear} and ${maxYear}`;
        isValid = false;
      } else if (includeAdvance && endDate < today) {
        newErrors.endDate = "End date must be today or in the future for advance salary";
        isValid = false;
      } else if (new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = "End date must be after start date";
        isValid = false;
      }
    }

    setErrors(newErrors);

    if (isValid) {
      onSubmit(startDate, endDate, includeAdvance, isAdvance);
    }
  };
  
  if (!isOpen) return null;

  const getMinDate = () => {
    if (includeAdvance) {
      return today;
    }
    return undefined;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-slate-800">
        <h2 className="text-lg font-semibold mb-4">Create Salary</h2>

        <div className="mb-4 flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <label htmlFor="includeAdvance" className="text-sm font-medium block">
              Advance Salary Mode
            </label>
            <p className="text-xs text-gray-500 mt-0.5">
              {includeAdvance ? "Future dates only" : "Past/present dates"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={includeAdvance}
            onClick={() => setIncludeAdvance(!includeAdvance)}
            disabled={isCreating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              includeAdvance ? 'bg-blue-600' : 'bg-gray-300'
            } ${isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeAdvance ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Pay Period Start</label>
          <input
            type="date"
            className={`border rounded px-2 py-1 w-full ${errors.startDate ? 'border-red-500' : ''}`}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isCreating}
            min={getMinDate()}
            max={includeAdvance ? undefined : today}
          />
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Pay Period End</label>
          <input
            type="date"
            className={`border rounded px-2 py-1 w-full ${errors.endDate ? 'border-red-500' : ''}`}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isCreating}
            min={startDate || getMinDate()}
            max={includeAdvance ? undefined : today}
          />
          {errors.endDate && (
            <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isCreating || !!errors.startDate || !!errors.endDate}
          >
            {isCreating ? "Creating..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSalaryModal;