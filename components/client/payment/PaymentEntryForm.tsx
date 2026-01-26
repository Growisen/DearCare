import React, { useEffect } from "react";
import { X } from "lucide-react";
import { FormLineItem } from "@/types/paymentDetails.types";
import LineItemInput from "./LineItemInput";
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

interface PaymentEntryFormProps {
  groupName: string;
  setGroupName: (value: string) => void;
  lineItems: FormLineItem[];
  setLineItems: React.Dispatch<React.SetStateAction<FormLineItem[]>>;
  groupNotes: string;
  setGroupNotes: (value: string) => void;
  groupShowToClient: boolean;
  setGroupShowToClient: (value: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  loading: boolean;
  modeOfPayment: string;
  setModeOfPayment: (value: string) => void;
  startDate: string;
  paymentType: string;
  setPaymentType: (value: string) => void;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  isOpen?: boolean;
}

const PaymentEntryForm: React.FC<PaymentEntryFormProps> = ({
  groupName,
  setGroupName,
  lineItems,
  setLineItems,
  groupNotes,
  setGroupNotes,
  groupShowToClient,
  setGroupShowToClient,
  onSave,
  onCancel,
  isSaving,
  loading,
  modeOfPayment,
  setModeOfPayment,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  paymentType,
  setPaymentType,
  isOpen = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const addLineItem = () => {
    const newItem: FormLineItem = { 
      id: `field-${Date.now()}`, 
      fieldName: "", 
      amount: "", 
      gst: "",
      commission: ""
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const updateLineItem = (id: string, key: keyof FormLineItem, value: string) => {
    setLineItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    } else {
      alert("You must have at least one line item.");
    }
  };

  const paymentTypes = [
    { value: "cash", label: "Cash" },
    { value: "bank transfer", label: "Bank Transfer" },
  ];

  const visibilityOptions = [
    { value: "yes", label: "Visible to Client" },
    { value: "no", label: "Hidden (Internal Only)" },
  ];

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-sm w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="text-lg font-bold text-gray-800">New Payment Entry</h3>
              <p className="text-xs text-gray-500 font-normal">Fill in the details below to record a transaction.</p>
            </div>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-sm hover:bg-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Payment Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Monthly Retainer - October"
                  className="w-full text-sm text-gray-800 px-3 py-2 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300 transition-colors"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  A short, recognizable name for this transaction.
                </p>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Received Via
                </label>
                <input
                  type="text"
                  value={modeOfPayment}
                  onChange={(e) => setModeOfPayment(e.target.value)}
                  placeholder="e.g., UPI, Bank Transfer"
                  className="w-full text-sm text-gray-800 px-3 py-2 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300 transition-colors"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Payment Type
                </label>
                <Select
                  value={paymentType}
                  onValueChange={setPaymentType}
                >
                  <SelectTrigger className="w-full text-sm text-gray-800 px-3 py-2 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300 bg-white">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-800">
                    <SelectGroup>
                      <SelectLabel>Type</SelectLabel>
                      {paymentTypes.map((type) => (
                        <SelectItem 
                          key={type.value} 
                          value={type.value}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-sm border border-slate-200">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Payment Context
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Coverage Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-gray-700 text-sm px-3 py-1.5 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Coverage End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full text-gray-700 text-sm px-3 py-1.5 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Who can see this?
                  </label>
                  <Select
                    value={groupShowToClient ? "yes" : "no"}
                    onValueChange={(val) => setGroupShowToClient(val === "yes")}
                  >
                    <SelectTrigger className="w-full text-gray-700 text-sm px-3 py-1.5 border border-slate-200 rounded-sm bg-white focus:outline-none focus:border-slate-300">
                      <SelectValue placeholder="Select visibility..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-800">
                      <SelectGroup>
                        <SelectLabel>Visibility</SelectLabel>
                        {visibilityOptions.map((opt) => (
                          <SelectItem 
                            key={opt.value} 
                            value={opt.value}
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col border-b border-slate-200 pb-2">
                <label className="text-sm font-bold text-gray-800">
                  Payment Breakdown
                </label>
                <span className="text-[11px] text-gray-500">
                  List the individual items or services included in this total amount.
                </span>
              </div>
              
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <LineItemInput
                    key={item.id}
                    item={item}
                    onUpdate={updateLineItem}
                    onRemove={removeLineItem}
                    canRemove={lineItems.length > 1}
                  />
                ))}
              </div>
              
              <button
                onClick={addLineItem}
                className="w-full py-2 border-2 border-dashed border-slate-200 rounded-sm text-gray-500 text-sm hover:border-slate-300 hover:text-gray-700 transition-colors hover:bg-gray-50"
              >
                + Add Another Item
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Internal Notes / References
              </label>
              <textarea
                value={groupNotes}
                onChange={(e) => setGroupNotes(e.target.value)}
                placeholder="e.g. Client requested split payment..."
                rows={2}
                className="w-full text-sm px-3 py-2 text-gray-700 border border-slate-200 rounded-sm focus:outline-none focus:border-slate-300"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-gray-50 flex justify-end items-center gap-3">
            <button
              onClick={onCancel}
              className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-sm border border-slate-200 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2 px-6 rounded-sm transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default PaymentEntryForm;