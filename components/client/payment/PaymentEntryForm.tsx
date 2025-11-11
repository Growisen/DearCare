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
}) => {
  const addLineItem = () => {
    const newItem: FormLineItem = { 
      id: `field-${Date.now()}`, 
      fieldName: "", 
      amount: "", 
      gst: "" 
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
      alert("You must have at least one field.");
    }
  };

  return (
    <details className="bg-white rounded border border-gray-300 p-5 space-y-5">
      <summary className="font-medium text-gray-800 cursor-pointer hover:text-gray-600 transition-colors">
        Add New Payment
      </summary>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Group Name *
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="e.g., Monthly Expenses"
          className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </div>

      <div className="space-y-3 pt-4 border-t">
        <label className="block text-sm font-medium text-gray-700">
          Fields & Amounts *
        </label>
        {lineItems.map((item) => (
          <LineItemInput
            key={item.id}
            item={item}
            onUpdate={updateLineItem}
            onRemove={removeLineItem}
            canRemove={lineItems.length > 1}
          />
        ))}
        <button
          onClick={addLineItem}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-1 px-3 rounded transition-colors"
        >
          + Add Another Field
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={groupNotes}
            onChange={(e) => setGroupNotes(e.target.value)}
            placeholder="Add shared notes for all fields above..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Show to Client
          </label>
          <select
            value={groupShowToClient ? 'yes' : 'no'}
            onChange={(e) => setGroupShowToClient(e.target.value === 'yes')}
            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={loading}
          className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </details>
  );
};

export default PaymentEntryForm;