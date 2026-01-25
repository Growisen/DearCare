import React, { useState, useEffect } from "react";
import { SalaryPayment } from "../types";
import ModalPortal from "@/components/ui/ModalPortal";

interface AddBonusModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  payment: SalaryPayment | null;
  onClose: () => void;
  onSubmit: (paymentId: number, bonusAmount: number, bonusReason: string) => Promise<void>;
}

const AddBonusModal: React.FC<AddBonusModalProps> = ({
  isOpen,
  isProcessing,
  payment,
  onClose,
  onSubmit,
}) => {
  const [bonusAmount, setBonusAmount] = useState<string>("");
  const [bonusReason, setBonusReason] = useState<string>("");
  const [errors, setErrors] = useState({ amount: "", reason: "" });

  useEffect(() => {
    if (isOpen && payment) {
      setBonusAmount("");
      setBonusReason("");
      setErrors({ amount: "", reason: "" });
    }
  }, [isOpen, payment]);

  const handleSubmit = () => {
    const newErrors = { amount: "", reason: "" };
    let isValid = true;

    const amount = parseFloat(bonusAmount);
    
    if (!bonusAmount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Please enter a valid positive amount";
      isValid = false;
    }

    if (!bonusReason.trim()) {
      newErrors.reason = "Please provide a reason for the bonus";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid && payment) {
      onSubmit(payment.id, amount, bonusReason);
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-1 sm:p-2">
      <div className="bg-white rounded-sm p-6 w-full max-w-md text-slate-800">
        <h2 className="text-lg font-semibold mb-4">Add Bonus</h2>
        <div className="mb-1">
          <div className="text-sm text-gray-600 mb-3">
            <p><span className="font-medium">Pay Period:</span> {payment.payPeriodStart} to {payment.payPeriodEnd}</p>
            <p><span className="font-medium">Current Salary:</span> ₹ {payment.netSalary.toLocaleString()}</p>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Bonus Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`no-spinner border border-slate-200 focus:border-slate-300 focus:outline-none rounded-sm px-3
             py-2 w-full ${errors.amount ? 'border-red-500' : ''}`}
            value={bonusAmount}
            onChange={(e) => setBonusAmount(e.target.value)}
            disabled={isProcessing}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="Enter bonus amount"
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
            value={bonusReason}
            onChange={(e) => setBonusReason(e.target.value)}
            disabled={isProcessing}
            placeholder="Provide a reason for this bonus"
          />
          {errors.reason && (
            <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="flex justify-center items-center text-center rounded-sm border border-slate-200
               bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none
               focus:border-slate-300"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1.5 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-medium"
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Add Bonus"}
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
};

export default AddBonusModal;