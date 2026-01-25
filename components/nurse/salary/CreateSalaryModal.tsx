import React, { useState, useEffect } from "react";
import ModalPortal from "@/components/ui/ModalPortal";

interface CreateSalaryModalProps {
  isOpen: boolean;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (startDate: string, endDate: string) => void;
}

const CreateSalaryModal: React.FC<CreateSalaryModalProps> = ({
  isOpen,
  isCreating,
  onClose,
  onSubmit,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({ startDate: "", endDate: "" });
  
  const today = new Date().toISOString().split('T')[0];
  const minYear = 2025;
  const maxYear = new Date().getFullYear();

  useEffect(() => {
    if (isOpen) {
      setStartDate("");
      setEndDate("");
      setErrors({ startDate: "", endDate: "" });
    }
  }, [isOpen]);
  
  useEffect(() => {
    const newErrors = { startDate: "", endDate: "" };

    if (startDate) {
      const startYear = new Date(startDate).getFullYear();
      if (startYear < minYear || startYear > maxYear) {
        newErrors.startDate = `Year must be between ${minYear} and ${maxYear}`;
      }
    }

    if (endDate) {
      const endYear = new Date(endDate).getFullYear();
      if (endYear < minYear || endYear > maxYear) {
        newErrors.endDate = `Year must be between ${minYear} and ${maxYear}`;
      }
    }

    if (startDate && endDate && !newErrors.startDate && !newErrors.endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
  }, [startDate, endDate, minYear, maxYear]);
  
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
      } else if (new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = "End date must be after start date";
        isValid = false;
      }
    }

    setErrors(newErrors);

    if (isValid) {
      onSubmit(startDate, endDate);
    }
  };
  
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center
      animate-in fade-in duration-200 p-1 sm:p-2"
      >
        <div className="bg-white rounded-sm p-6 w-full max-w-md text-gray-800 border border-slate-300">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b border-slate-200 pb-3">
            Create Salary
          </h2>
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-gray-700">Pay Period Start</label>
            <input
              type="date"
              className={`border border-slate-200 rounded-sm px-3 py-2.5 w-full focus:outline-none focus:border-slate-300
                transition-colors ${errors.startDate ? 'border-red-400 focus:border-red-400' : ''}`}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isCreating}
              max={today}
            />
            {errors.startDate && (
              <p className="text-red-600 text-xs mt-1.5">{errors.startDate}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Pay Period End</label>
            <input
              type="date"
              className={`border border-slate-200 rounded-sm px-3 py-2.5 w-full focus:outline-none focus:border-slate-300
                transition-colors ${errors.endDate ? 'border-red-400 focus:border-red-400' : ''}`}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isCreating}
              min={startDate}
              max={today}
            />
            {errors.endDate && (
              <p className="text-red-600 text-xs mt-1.5">{errors.endDate}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="px-5 py-1.5 rounded-sm border border-slate-200 text-gray-700 font-medium hover:bg-gray-100
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              className="px-5 py-1.5 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isCreating || !!errors.startDate || !!errors.endDate}
            >
              {isCreating ? "Creating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default CreateSalaryModal;