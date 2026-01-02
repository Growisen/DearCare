import React from "react";
import { EntryGroup } from "@/types/paymentDetails.types";
import { calculateTotalAmount } from "@/utils/clientPaymentUtils";

interface SummaryStatsProps {
  entries: EntryGroup[];
}

const calculateTotalCommission = (groups: EntryGroup[]) => {
  return groups.reduce((sum, group) => {
    if (!group.lineItems) return sum;
    return (
      sum +
      group.lineItems.reduce((itemSum, item) => itemSum + (item.commission || 0), 0)
    );
  }, 0);
};

const SummaryStats: React.FC<SummaryStatsProps> = ({ entries }) => {
  const totalAmount = calculateTotalAmount(entries);
  const avgPerGroup = entries.length > 0 ? totalAmount / entries.length : 0;
  const clientVisibleCount = entries.filter(g => g.showToClient).length;
  const totalCommission = calculateTotalCommission(entries);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      <div className="bg-white rounded-sm shadow-none border border-slate-200 p-6 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {entries.length}
        </div>
        <div className="text-sm text-gray-600">Total Groups</div>
      </div>
      
      <div className="bg-white rounded-sm shadow-none border border-slate-200 p-6 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          ₹{totalAmount.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </div>
        <div className="text-sm text-gray-600">Total Amount</div>
      </div>
      
      <div className="bg-white rounded-sm shadow-none border border-slate-200 p-6 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          ₹{avgPerGroup.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </div>
        <div className="text-sm text-gray-600">Avg. / Group</div>
      </div>
      
      <div className="bg-white rounded-sm shadow-none border border-slate-200 p-6 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {clientVisibleCount}
        </div>
        <div className="text-sm text-gray-600">Client Visible</div>
      </div>

      <div className="bg-white rounded-sm shadow-none border border-slate-200 p-6 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          ₹{totalCommission.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
        <div className="text-sm text-gray-600">Total Commission</div>
      </div>
    </div>
  );
};

export default SummaryStats;