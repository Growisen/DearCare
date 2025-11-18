import React from "react";
import { FormLineItem } from "@/types/paymentDetails.types";
import LineItemInput from "./LineItemInput";

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
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
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
}) => {
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

  return (
    <details className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden open:pb-4">
      <summary className="px-4 py-3 bg-gray-50 font-semibold text-gray-800 cursor-pointer hover:bg-gray-100
       transition-colors text-sm flex items-center justify-between select-none">
        <span>New Payment Entry</span>
        <span className="text-xs text-gray-500 font-normal">Click to expand</span>
      </summary>

      <div className="px-4 pt-4 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
              Payment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Monthly Retainer - October"
              className="w-full text-sm text-gray-800 px-3 py-2 border border-gray-300 rounded focus:outline-none 
              focus:ring-1 focus:ring-gray-400 focus:border-transparent"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              A short, recognizable name for this transaction.
            </p>
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
              Received Via
            </label>
            <input
              type="text"
              value={modeOfPayment}
              onChange={(e) => setModeOfPayment(e.target.value)}
              placeholder="e.g., UPI, Bank Transfer"
              className="w-full text-sm text-gray-800 px-3 py-2 border border-gray-300 rounded focus:outline-none 
              focus:ring-1 focus:ring-gray-400 focus:border-transparent"
            />
             <p className="text-[11px] text-gray-500 mt-1">
              The method used for this payment.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded border border-gray-100">
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
                className="w-full text-gray-700 text-sm px-3 py-1.5 border border-gray-300 rounded
                 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
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
                className="w-full text-gray-700 text-sm px-3 py-1.5 border border-gray-300 rounded
                 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Who can see this?
              </label>
              <select
                value={groupShowToClient ? 'yes' : 'no'}
                onChange={(e) => setGroupShowToClient(e.target.value === 'yes')}
                className="w-full text-gray-700 text-sm px-3 py-1.5 border border-gray-300 rounded
                 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="yes">Visible to Client</option>
                <option value="no">Hidden (Internal Only)</option>
              </select>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Define the date range for which this payment is being collected, and control if the client sees this entry.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col border-b pb-2">
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
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 
            text-sm hover:border-gray-400 hover:text-gray-700 transition-all hover:bg-gray-50"
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
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none 
            focus:ring-1 focus:ring-gray-400 focus:border-transparent"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            These notes are for your record keeping and usually not shown on simple invoices.
          </p>
        </div>

        <div className="flex justify-end items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="bg-gray-900 hover:bg-black text-white text-sm font-medium py-2 px-6
             rounded shadow-sm transition-colors disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>
    </details>
  );
};

export default PaymentEntryForm;