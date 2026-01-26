import React, { ChangeEvent, useEffect, useState } from "react";
import ModalPortal from "@/components/ui/ModalPortal";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/Select";

export interface RefundSubmitData {
  id?: number;
  amount: number;
  reason?: string;
  paymentMethod: string;
  paymentType: string;
  refundDate: string;
}

type RefundModalProps = {
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onSubmit: (data: RefundSubmitData) => Promise<void>;
  initialData?: RefundSubmitData | null;
};

const paymentTypes = ["cash", "bank transfer"];

const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  isProcessing,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditMode = !!initialData;

  const [form, setForm] = useState({
    amount: "",
    paymentMethod: "",
    paymentType: "",
    reason: "",
    refundDate: new Date().toISOString().slice(0, 10),
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialData) {
        setForm({
          amount: initialData.amount.toString(),
          paymentMethod: initialData.paymentMethod,
          paymentType: initialData.paymentType,
          reason: initialData.reason || "",
          refundDate: initialData.refundDate
            ? new Date(initialData.refundDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        });
      } else {
        setForm({
          amount: "",
          paymentMethod: "",
          paymentType: "",
          reason: "",
          refundDate: new Date().toISOString().slice(0, 10),
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.amount || !form.paymentMethod || !form.paymentType || !form.refundDate) {
      setError("Please fill in all required fields.");
      return;
    }
    if (Number(form.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    await onSubmit({
      ...(initialData?.id ? { id: initialData.id } : {}),
      amount: Number(form.amount),
      reason: form.reason,
      paymentMethod: form.paymentMethod,
      paymentType: form.paymentType,
      refundDate: form.refundDate,
    });
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-sm p-8 w-full max-w-xl shadow-lg flex flex-col max-h-[90vh]">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">
            {isEditMode ? "Edit Refund Payment" : "Create Refund Payment"}
          </h2>

          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="overflow-y-auto flex-1 pr-1">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium text-slate-700 text-sm">
                  Refund Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  min={0}
                  className="w-full border border-slate-200 rounded-sm px-2 py-3 text-slate-900 focus:outline-none
                    focus:ring-0 focus:border-slate-300 placeholder:text-slate-400 text-sm"
                  value={form.amount}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, amount: e.target.value }));
                    if (error) setError(null);
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  disabled={isProcessing}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium text-slate-700 text-sm">
                  Refund Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-sm px-2 py-3 text-slate-900 focus:outline-none focus:ring-0 focus:border-slate-300 text-sm"
                  value={form.refundDate}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, refundDate: e.target.value }));
                    if (error) setError(null);
                  }}
                  disabled={isProcessing}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-slate-700 text-sm">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter payment method"
                className="w-full border border-slate-200 rounded-sm px-2 py-3 text-slate-900 focus:outline-none focus:ring-0 
                focus:border-slate-300 placeholder:text-slate-400 text-sm"
                value={form.paymentMethod}
                onChange={(e) => {
                  setForm((f) => ({ ...f, paymentMethod: e.target.value }));
                  if (error) setError(null);
                }}
                disabled={isProcessing}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-slate-700 text-sm">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.paymentType}
                onValueChange={(val) => {
                  setForm((f) => ({ ...f, paymentType: val }));
                  if (error) setError(null);
                }}
                disabled={isProcessing}
              >
                <SelectTrigger className="w-full bg-white border-slate-200 text-gray-800 text-sm h-11">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-800">
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    {paymentTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium text-slate-700 text-sm">
                Reason / Notes
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-sm px-2 py-3 text-slate-900 focus:outline-none focus:ring-0
                  focus:border-slate-300 placeholder:text-slate-400 resize-none h-20 text-sm"
                value={form.reason}
                placeholder="Brief reason for refund..."
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                disabled={isProcessing}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
            <button
              className="px-4 py-2 rounded-sm bg-gray-200 text-slate-800 hover:bg-gray-300 transition-colors text-sm font-medium"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-sm bg-blue-700 text-white hover:bg-blue-800 transition-colors text-sm font-medium shadow-sm"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : isEditMode
                ? "Save Changes"
                : "Create Refund"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default RefundModal;