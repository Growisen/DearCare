"use client"

import React, { useState, useEffect } from "react";
import { insertAdvancePayment } from "@/app/actions/staff-management/advance-payments";
import FileUpload from "@/components/ui/FileUpload";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface CreateAdvancePaymentModalProps {
  isOpen: boolean;
  nurseId: number;
  onClose: () => void;
  onSubmit?: (date: string, amount: number, returnType: string, installmentAmount?: number, receiptFile?: File | null) => void;
  onCreated?: (payment: {
    nurse_id: number;
    date: string;
    advance_amount: number;
    return_type: "full" | "partial";
    installment_amount?: number;
    remaining_amount: number;
    deductions: [];
    receipt_file?: File | null;
  }) => void;
}

const CreateAdvancePaymentModal: React.FC<CreateAdvancePaymentModalProps> = ({
  isOpen,
  nurseId,
  onClose,
  onSubmit,
  onCreated,
}) => {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [repaymentType, setRepaymentType] = useState("full");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [info, setInfo] = useState(""); // Add this state
  const [errors, setErrors] = useState({ 
    date: "", 
    amount: "", 
    installmentAmount: "",
    paymentMethod: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const minYear = 2025;
  const maxYear = new Date().getFullYear();

  useEffect(() => {
    if (isOpen) {
      setDate("");
      setAmount("");
      setRepaymentType("full");
      setInstallmentAmount("");
      setPaymentMethod("");
      setReceiptFile(null);
      setInfo(""); // Reset info on open
      setErrors({ date: "", amount: "", installmentAmount: "", paymentMethod: "" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (repaymentType === "full") {
      setInstallmentAmount("");
      setErrors(prev => ({ ...prev, installmentAmount: "" }));
    }
  }, [repaymentType]);
  
  useEffect(() => {
    const newErrors = { date: "", amount: "", installmentAmount: "", paymentMethod: "" };

    if (date) {
      const dateYear = new Date(date).getFullYear();
      if (dateYear < minYear || dateYear > maxYear) {
        newErrors.date = `Year must be between ${minYear} and ${maxYear}`;
      }
    }

    if (amount) {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "Amount must be greater than 0";
      }
    }

    if (repaymentType === "installments" && installmentAmount) {
      const installmentNum = parseFloat(installmentAmount);
      const amountNum = parseFloat(amount);
      
      if (isNaN(installmentNum) || installmentNum <= 0) {
        newErrors.installmentAmount = "Installment amount must be greater than 0";
      } else if (amountNum && installmentNum >= amountNum) {
        newErrors.installmentAmount = "Installment amount must be less than advance amount";
      }
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }
    setErrors(newErrors);
  }, [date, amount, repaymentType, installmentAmount, paymentMethod]);
  
  const handleSubmit = async () => {
    const newErrors = { date: "", amount: "", installmentAmount: "", paymentMethod: "" };
    let isValid = true;

    if (!date) {
      newErrors.date = "Date is required";
      isValid = false;
    } else {
      const dateYear = new Date(date).getFullYear();
      if (dateYear < minYear || dateYear > maxYear) {
        newErrors.date = `Year must be between ${minYear} and ${maxYear}`;
        isValid = false;
      }
    }

    if (!amount) {
      newErrors.amount = "Advance amount is required";
      isValid = false;
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "Amount must be greater than 0";
        isValid = false;
      }
    }

    if (repaymentType === "installments") {
      if (!installmentAmount) {
        newErrors.installmentAmount = "Installment amount is required";
        isValid = false;
      } else {
        const installmentNum = parseFloat(installmentAmount);
        const amountNum = parseFloat(amount);
        
        if (isNaN(installmentNum) || installmentNum <= 0) {
          newErrors.installmentAmount = "Installment amount must be greater than 0";
          isValid = false;
        } else if (installmentNum >= amountNum) {
          newErrors.installmentAmount = "Installment amount must be less than advance amount";
          isValid = false;
        }
      }
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
      isValid = false;
    }
    setErrors(newErrors);
    if (isValid) {
      setIsSubmitting(true);
      const advanceAmount = parseFloat(amount);
      const installmentAmt = repaymentType === "installments" ? parseFloat(installmentAmount) : undefined;
      try {
        const payment = await insertAdvancePayment({
          nurse_id: nurseId,
          date,
          advance_amount: advanceAmount,
          return_type: repaymentType as "full" | "installments",
          installment_amount: installmentAmt,
          payment_method: paymentMethod,
          deductions: [],
          receipt_file: receiptFile,
          info,
        });
        if (onCreated) onCreated(payment);
        if (onSubmit) onSubmit(date, advanceAmount, repaymentType, installmentAmt, receiptFile);
        onClose();
      } catch {
        setErrors(prev => ({ ...prev, amount: "Failed to create payment" }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-md shadow-xl p-6 w-full max-w-lg text-gray-800 border border-gray-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b border-gray-200 pb-3">
          Create Advance Payment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Date</label>
            <input
              type="date"
              className={`border border-gray-300 rounded-md px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors ${errors.date ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
            />
            {errors.date && (
              <p className="text-red-600 text-xs mt-1.5">{errors.date}</p>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Advance Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`border border-gray-300 rounded-md px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors ${errors.amount ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-600 text-xs mt-1.5">{errors.amount}</p>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Repayment Type</label>
            <Select value={repaymentType} onValueChange={setRepaymentType}>
              <SelectTrigger className="w-full py-6 border border-gray-300 rounded-md focus:outline-none transition-colors bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-800">
                <SelectGroup>
                  <SelectLabel>Repayment Type</SelectLabel>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="installments">Installments</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {repaymentType === "installments" && (
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-2 text-gray-700">Installment Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`border border-gray-300 rounded-md px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors ${errors.installmentAmount ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(e.target.value)}
                placeholder="0.00"
              />
              {errors.installmentAmount && (
                <p className="text-red-600 text-xs mt-1.5">{errors.installmentAmount}</p>
              )}
            </div>
          )}

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Payment Method</label>
            <input
              type="text"
              className={`border border-gray-300 rounded-md px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors ${errors.paymentMethod ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Method"
            />
            {errors.paymentMethod && (
              <p className="text-red-600 text-xs mt-1.5">{errors.paymentMethod}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <FileUpload
              label="Receipt / Screenshot"
              value={receiptFile}
              onChange={setReceiptFile}
              accept="image/*,application/pdf"
              helperText="Optional: Upload a transaction receipt."
            />
          </div>
          {/* Add this textarea field */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">Additional Info</label>
            <textarea
              className="border border-gray-300 rounded-md px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              rows={3}
              placeholder="Any additional information (optional)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
          <button
            className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2.5 rounded-md bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleSubmit}
            disabled={!!errors.date || !!errors.amount || !!errors.installmentAmount || !!errors.paymentMethod || isSubmitting}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : null}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAdvancePaymentModal;