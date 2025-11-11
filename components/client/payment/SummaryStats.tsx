import React from "react";
import { EntryGroup } from "@/types/paymentDetails.types";
import { calculateTotalAmount } from "@/utils/clientPaymentUtils";

interface SummaryStatsProps {
  entries: EntryGroup[];
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ entries }) => {
  const totalAmount = calculateTotalAmount(entries);
  const avgPerGroup = entries.length > 0 ? totalAmount / entries.length : 0;
  const clientVisibleCount = entries.filter(g => g.showToClient).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {entries.length}
        </div>
        <div className="text-sm text-gray-600">Total Groups</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          ₹{totalAmount.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </div>
        <div className="text-sm text-gray-600">Total Amount</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          ₹{avgPerGroup.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </div>
        <div className="text-sm text-gray-600">Avg. / Group</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {clientVisibleCount}
        </div>
        <div className="text-sm text-gray-600">Client Visible</div>
      </div>
    </div>
  );
};

export default SummaryStats;