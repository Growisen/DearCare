import React, { useState, useEffect } from "react";
import { SalaryPayment } from "../types";

interface AddDeductionModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  payment: SalaryPayment | null;
  onClose: () => void;
  onSubmit: (paymentId: number, deductionAmount: number, deductionReason: string) => Promise<void>;
}

const AddDeductionModal: React.FC<AddDeductionModalProps> = ({
  isOpen,
  isProcessing,
  payment,
  onClose,
  onSubmit,
}) => {
  const [deductionAmount, setDeductionAmount] = useState<string>("");
  const [deductionReason, setDeductionReason] = useState<string>("");
  const [errors, setErrors] = useState({ amount: "", reason: "" });

  useEffect(() => {
    if (isOpen && payment) {
      setDeductionAmount("");
      setDeductionReason("");
      setErrors({ amount: "", reason: "" });
    }
  }, [isOpen, payment]);

  const handleSubmit = () => {
    const newErrors = { amount: "", reason: "" };
    let isValid = true;

    const amount = parseFloat(deductionAmount);

    if (!deductionAmount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Please enter a valid positive amount";
      isValid = false;
    }

    if (!deductionReason.trim()) {
      newErrors.reason = "Please provide a reason for the deduction";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid && payment) {
      onSubmit(payment.id, amount, deductionReason);
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in
     fade-in duration-200 p-1 sm:p-2"
    >
      <div className="bg-white rounded-sm p-6 w-full max-w-md text-slate-800">
        <h2 className="text-lg font-semibold mb-4">Add Deduction</h2>
        <div className="mb-1">
          <div className="text-sm text-gray-600 mb-3">
            <p><span className="font-medium">Pay Period:</span> {payment.payPeriodStart} to {payment.payPeriodEnd}</p>
            <p><span className="font-medium">Current Salary:</span> ₹ {payment.salary.toLocaleString()}</p>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Deduction Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`no-spinner border border-slate-200 focus:border-slate-300 focus:outline-none rounded-sm px-3 py-2
             w-full ${errors.amount ? 'border-red-500' : ''}`}
            value={deductionAmount}
            onChange={(e) => setDeductionAmount(e.target.value)}
            disabled={isProcessing}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="Enter deduction amount"
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea
            className={`border border-slate-200 focus:border-slate-300 focus:outline-none rounded-sm px-3 py-2
             w-full h-24 resize-none ${errors.reason ? 'border-red-500' : ''}`}
            value={deductionReason}
            onChange={(e) => setDeductionReason(e.target.value)}
            disabled={isProcessing}
            placeholder="Provide a reason for this deduction"
          />
          {errors.reason && (
            <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="flex justify-center items-center text-center rounded-sm border border-slate-200
              bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none
             focus:border-slate-300"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1.5 rounded-sm bg-red-700 hover:bg-red-800 text-white font-medium"
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Add Deduction"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDeductionModal;