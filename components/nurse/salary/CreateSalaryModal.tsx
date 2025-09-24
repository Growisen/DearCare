import React, { useState, useEffect } from "react";

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
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStartDate("");
      setEndDate("");
      setErrors({ startDate: "", endDate: "" });
    }
  }, [isOpen]);
  
  // Validate dates whenever they change
  useEffect(() => {
    const newErrors = { startDate: "", endDate: "" };
    
    if (startDate && endDate) {
      // Validate end date is after start date
      if (new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }
    
    setErrors(newErrors);
  }, [startDate, endDate]);
  
  const handleSubmit = () => {
    // Validate required fields
    const newErrors = { startDate: "", endDate: "" };
    let isValid = true;
    
    if (!startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    }
    
    if (!endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    } else if (new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
      isValid = false;
    }
    
    setErrors(newErrors);
    
    if (isValid) {
      onSubmit(startDate, endDate);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-slate-800">
        <h2 className="text-lg font-semibold mb-4">Create Salary</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Pay Period Start</label>
          <input
            type="date"
            className={`border rounded px-2 py-1 w-full ${errors.startDate ? 'border-red-500' : ''}`}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isCreating}
            max={today}
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
            min={startDate || undefined}
            max={today}
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
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
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