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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-start">
        <input
          type="text"
          value={item.fieldName}
          onChange={(e) => onUpdate(item.id, 'fieldName', e.target.value)}
          placeholder="Field name"
          className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
        <input
          type="number"
          value={item.amount}
          onChange={(e) => onUpdate(item.id, 'amount', e.target.value)}
          placeholder="Amount (₹)"
          className="w-[140px] px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
        <input
          type="number"
          value={item.gst ?? ""}
          onChange={(e) => onUpdate(item.id, 'gst', e.target.value)}
          placeholder="GST (%)"
          min="0"
          max="100"
          className="w-[120px] px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
        <input
          type="number"
          value={item.commission ?? ""}
          onChange={(e) => onUpdate(item.id, 'commission', e.target.value)}
          placeholder="Commission (₹)"
          min="0"
          max="100"
          className="w-[160px] px-3 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
        <button
          onClick={() => onRemove(item.id)}
          className="px-4 py-2 text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          disabled={!canRemove}
        >
          Remove
        </button>
      </div>
      {gst > 0 && (
        <div className="text-sm text-gray-600 pl-2">
          GST Amount: ₹{gstAmount.toFixed(2)} | Total with GST: ₹{totalWithGst.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default LineItemInput;