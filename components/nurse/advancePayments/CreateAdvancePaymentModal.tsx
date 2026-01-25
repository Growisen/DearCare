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
import { Loader } from "lucide-react";

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
  const [paymentType, setPaymentType] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [info, setInfo] = useState("");
  const [errors, setErrors] = useState({ 
    date: "", 
    amount: "", 
    installmentAmount: "",
    paymentMethod: "",
    paymentType: ""
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
      setPaymentType("");
      setReceiptFile(null);
      setInfo("");
      setErrors({ date: "", amount: "", installmentAmount: "", paymentMethod: "", paymentType: "" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (repaymentType === "full") {
      setInstallmentAmount("");
      setErrors(prev => ({ ...prev, installmentAmount: "" }));
    }
  }, [repaymentType]);
  
  useEffect(() => {
    const newErrors = { date: "", amount: "", installmentAmount: "", paymentMethod: "", paymentType: "" };

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
    if (!paymentType) {
      newErrors.paymentType = "Payment type is required";
    }
    setErrors(newErrors);
  }, [date, amount, repaymentType, installmentAmount, paymentMethod, paymentType, minYear, maxYear]);
  
  const handleSubmit = async () => {
    const newErrors = { date: "", amount: "", installmentAmount: "", paymentMethod: "", paymentType: "" };
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
    if (!paymentType) {
      newErrors.paymentType = "Payment type is required";
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
          paymentType,
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
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center
      animate-in fade-in duration-200 p-1 sm:p-2"
    >
      <div className="bg-white rounded-sm p-6 w-full max-w-2xl text-gray-800 border border-slate-200
        max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b border-slate-200 pb-3">
          Create Advance Payment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Date</label>
            <input
              type="date"
              className={`border border-slate-200 rounded-sm px-3 py-[9px] w-full focus:outline-none focus:border-slate-300
                transition-colors ${errors.date ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
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
              className={`border no-spinner border-slate-200 rounded-sm px-3 py-2.5 w-full focus:outline-none
              focus:border-slate-300 transition-colors ${errors.amount ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
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
              <SelectTrigger className="w-full py-[22.5px] border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300 transition-colors bg-white">
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
                className={`border border-slate-200 rounded-sm px-3 py-2.5 w-full focus:outline-none focus:border-slate-300
                 transition-colors ${errors.installmentAmount ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
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
              className={`border border-slate-200 rounded-sm px-3 py-2.5 w-full focus:outline-none focus:border-slate-300
                transition-colors ${errors.paymentMethod ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Method"
            />
            {errors.paymentMethod && (
              <p className="text-red-600 text-xs mt-1.5">{errors.paymentMethod}</p>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Payment Type</label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className={`w-full py-[22.5px] border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300 transition-colors bg-white ${errors.paymentType ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-800">
                <SelectGroup>
                  <SelectLabel>Payment Type</SelectLabel>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.paymentType && (
              <p className="text-red-600 text-xs mt-1.5">{errors.paymentType}</p>
            )}
          </div>

          <div className="col-span-1">
            <FileUpload
              label="Receipt / Screenshot"
              value={receiptFile}
              onChange={setReceiptFile}
              accept="image/*,application/pdf"
              helperText="Optional: Upload a transaction receipt."
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">Additional Info</label>
            <textarea
              className="border border-slate-200 rounded-sm px-3 py-2.5 w-full focus:outline-none focus:border-slate-300 transition-colors"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              rows={3}
              placeholder="Any additional information (optional)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            className="px-5 py-1.5 rounded-sm border border-slate-200 text-gray-700 font-medium hover:bg-gray-50 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="px-5 py-1.5 rounded-sm bg-blue-700 text-white font-medium hover:bg-blue-800 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleSubmit}
            disabled={!!errors.date || !!errors.amount || !!errors.installmentAmount || !!errors.paymentMethod || !!errors.paymentType || isSubmitting}
          >
            {isSubmitting ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : null}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAdvancePaymentModal;