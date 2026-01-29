"use client"

import React, { useState, useEffect } from "react";
import { useAdvancePaymentsById } from "@/hooks/useAdvancePaymentsById";
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
  onCreated?: () => void;
}

interface FormData {
  transactionType: "ADVANCE" | "REPAYMENT";
  date: string;
  amount: string;
  repaymentType: "full" | "installments";
  installmentAmount: string;
  paymentMethod: string;
  paymentType: string;
  info: string;
  receiptFile: File | null;
}

const initialFormData: FormData = {
  transactionType: "ADVANCE",
  date: "",
  amount: "",
  repaymentType: "full",
  installmentAmount: "",
  paymentMethod: "",
  paymentType: "",
  info: "",
  receiptFile: null,
};

const CreateAdvancePaymentModal: React.FC<CreateAdvancePaymentModalProps> = ({
  isOpen,
  nurseId,
  onClose,
  onCreated,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const minYear = 2025;
  const maxYear = new Date().getFullYear();

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (formData.date) {
      const dateYear = new Date(formData.date).getFullYear();
      if (dateYear < minYear || dateYear > maxYear) {
        newErrors.date = `Year must be between ${minYear} and ${maxYear}`;
      }
    }

    if (formData.amount) {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "Amount must be greater than 0";
      }
    }

    if (formData.transactionType === "ADVANCE" && formData.repaymentType === "installments" && formData.installmentAmount) {
      const installmentNum = parseFloat(formData.installmentAmount);
      const amountNum = parseFloat(formData.amount);
      
      if (isNaN(installmentNum) || installmentNum <= 0) {
        newErrors.installmentAmount = "Installment amount must be greater than 0";
      } else if (amountNum && installmentNum >= amountNum) {
        newErrors.installmentAmount = "Installment amount must be less than advance amount";
      }
    }

    setErrors(newErrors);
  }, [formData, minYear, maxYear]);

  const updateField = (
    field: keyof FormData,
    value:
      | FormData["transactionType"]
      | FormData["date"]
      | FormData["amount"]
      | FormData["repaymentType"]
      | FormData["installmentAmount"]
      | FormData["paymentMethod"]
      | FormData["paymentType"]
      | FormData["info"]
      | FormData["receiptFile"]
  ) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === "transactionType" && value === "REPAYMENT") {
        updated.repaymentType = "full";
        updated.installmentAmount = "";
      }
      
      if (field === "repaymentType" && value === "full") {
        updated.installmentAmount = "";
      }
      
      return updated;
    });
  };

  const { createAdvancePayment } = useAdvancePaymentsById(nurseId);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.date) {
      newErrors.date = "Date is required";
      isValid = false;
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
      isValid = false;
    }

    if (formData.transactionType === "ADVANCE" && formData.repaymentType === "installments" && !formData.installmentAmount) {
      newErrors.installmentAmount = "Installment amount is required";
      isValid = false;
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
      isValid = false;
    }
    if (!formData.paymentType) {
      newErrors.paymentType = "Payment type is required";
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));

    if (isValid && Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        await createAdvancePayment({
          nurse_id: nurseId,
          date: formData.date,
          advance_amount: parseFloat(formData.amount),
          transaction_type: formData.transactionType,
          return_type: formData.transactionType === "ADVANCE" ? formData.repaymentType : "full",
          installment_amount: formData.installmentAmount ? parseFloat(formData.installmentAmount) : undefined,
          payment_method: formData.paymentMethod,
          payment_type: formData.paymentType,
          receipt_file: formData.receiptFile,
          info: formData.info,
        });
        
        if (onCreated) onCreated();
        onClose();
      } catch {
        setErrors(prev => ({ ...prev, form: "Failed to create transaction" }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-1 sm:p-2">
      <div className="bg-white rounded-sm p-6 w-full max-w-2xl text-gray-800 border border-slate-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b border-slate-200 pb-3">
          New Transaction
        </h2>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-sm border border-red-200">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">Transaction Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold rounded border transition-colors shadow-sm
                  ${formData.transactionType === "ADVANCE"
                    ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-200"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}
                `}
                onClick={() => updateField("transactionType", "ADVANCE")}
                style={{ outline: "none" }}
              >
                Give Advance
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-semibold rounded border transition-colors shadow-sm
                  ${formData.transactionType === "REPAYMENT"
                    ? "bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-200"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}
                `}
                onClick={() => updateField("transactionType", "REPAYMENT")}
                style={{ outline: "none" }}
              >
                Receive Repayment
              </button>
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Date</label>
            <input
              type="date"
              className={`border border-slate-200 rounded-sm px-3 py-[9px] w-full focus:outline-none focus:border-slate-300
              transition-colors ${errors.date ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              max={today}
            />
            {errors.date && (
              <p className="text-red-600 text-xs mt-1.5">{errors.date}</p>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {formData.transactionType === "ADVANCE" ? "Advance Amount" : "Repayment Amount"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`border no-spinner border-slate-200 rounded-sm px-3 py-2.5 w-full focus:outline-none focus:border-slate-300 
              transition-colors ${errors.amount ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
              value={formData.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-600 text-xs mt-1.5">{errors.amount}</p>
            )}
          </div>

          {formData.transactionType === "ADVANCE" && (
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-2 text-gray-700">Repayment Plan</label>
              <Select 
                value={formData.repaymentType} 
                onValueChange={(val) => updateField("repaymentType", val)}
              >
                <SelectTrigger className="w-full py-[22.5px] border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300 
                  transition-colors bg-white"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  <SelectGroup>
                    <SelectLabel>Repayment Type</SelectLabel>
                    <SelectItem value="full" className="cursor-pointer hover:bg-gray-100">Full Return</SelectItem>
                    <SelectItem value="installments" className="cursor-pointer hover:bg-gray-100">Monthly Installments</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.transactionType === "ADVANCE" && formData.repaymentType === "installments" && (
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-2 text-gray-700">Monthly Installment</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`border border-slate-200 rounded-sm px-3 py-2.5 w-full focus:outline-none focus:border-slate-300 
                transition-colors ${errors.installmentAmount ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
                value={formData.installmentAmount}
                onChange={(e) => updateField("installmentAmount", e.target.value)}
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
              value={formData.paymentMethod}
              onChange={(e) => updateField("paymentMethod", e.target.value)}
              placeholder="Method"
            />
            {errors.paymentMethod && (
              <p className="text-red-600 text-xs mt-1.5">{errors.paymentMethod}</p>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2 text-gray-700">Payment Type</label>
            <Select 
              value={formData.paymentType} 
              onValueChange={(val) => updateField("paymentType", val)}
            >
              <SelectTrigger className={`w-full py-[22.5px] border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300
               transition-colors bg-white ${errors.paymentType ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-800">
                <SelectGroup>
                  <SelectLabel>Payment Type</SelectLabel>
                  <SelectItem value="cash" className="cursor-pointer hover:bg-gray-100">Cash</SelectItem>
                  <SelectItem value="bank transfer" className="cursor-pointer hover:bg-gray-100">Bank Transfer</SelectItem>
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
              value={formData.receiptFile}
              onChange={(file) => updateField("receiptFile", file)}
              accept="image/*,application/pdf"
              helperText="Optional: Upload a transaction receipt."
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">Additional Info</label>
            <textarea
              className="border border-slate-200 rounded-sm px-3 py-2.5 w-full focus:outline-none focus:border-slate-300 transition-colors"
              value={formData.info}
              onChange={(e) => updateField("info", e.target.value)}
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
            className={`px-5 py-1.5 rounded-sm text-white font-medium transition-colors disabled:opacity-50 
              disabled:cursor-not-allowed flex items-center justify-center ${
              formData.transactionType === 'ADVANCE' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            onClick={handleSubmit}
            disabled={!!errors.date || !!errors.amount || !!errors.installmentAmount || !!errors.paymentMethod || !!errors.paymentType || isSubmitting}
          >
            {isSubmitting ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : null}
            {formData.transactionType === 'ADVANCE' ? 'Create Advance' : 'Record Repayment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAdvancePaymentModal;