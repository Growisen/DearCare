import React from "react";
import { FormLineItem } from "@/types/paymentDetails.types";

interface LineItemInputProps {
  item: FormLineItem;
  onUpdate: (id: string, key: keyof FormLineItem, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const LineItemInput: React.FC<LineItemInputProps> = ({
  item,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const amount = parseFloat(item.amount) || 0;
  const gst = parseFloat(item.gst ?? "") || 0;
  const gstAmount = (amount * gst) / 100;
  const totalWithGst = amount + gstAmount;

  return (
    <div className="flex gap-3 items-center">
      <input
        type="text"
        value={item.fieldName}
        onChange={(e) => onUpdate(item.id, 'fieldName', e.target.value)}
        placeholder="Field name"
        className="flex-1 px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
      <input
        type="number"
        value={item.amount}
        onChange={(e) => onUpdate(item.id, 'amount', e.target.value)}
        placeholder="Amount (₹)"
        className="w-35 px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
      <input
        type="number"
        value={item.gst}
        onChange={(e) => onUpdate(item.id, 'gst', e.target.value)}
        placeholder="GST (%)"
        min="0"
        max="100"
        className="w-30 px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
      <input
        type="text"
        value={`₹${totalWithGst.toLocaleString('en-IN', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`}
        readOnly
        disabled
        placeholder="Total (₹)"
        className="w-36 px-3 py-2 border border-gray-300 rounded text-gray-700 bg-gray-100 focus:outline-none"
      />
      <button
        onClick={() => onRemove(item.id)}
        className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!canRemove}
      >
        Remove
      </button>
    </div>
  );
};

export default LineItemInput;