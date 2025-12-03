import React from "react";
import { EntryGroup } from "@/types/paymentDetails.types";
import { calculateGroupTotal, calculateItemTotal, formatDate } from "@/utils/clientPaymentUtils";

interface EntriesMobileViewProps {
  entries: EntryGroup[];
  onDelete: (id: number) => void;
  deletingId: string | null;
  onEdit?: (id: number) => void;
  onApprove?: (group: EntryGroup) => void;
  approvingId?: number | null;
}

const EntriesMobileView: React.FC<EntriesMobileViewProps> = ({
  entries,
  onDelete,
  deletingId,
  onEdit,
  onApprove,
  approvingId,
}) => {
  return (
    <div className="xl:hidden divide-y divide-gray-200">
      {entries.map((group) => {
        const groupTotal = calculateGroupTotal(group);

        return (
          <div key={group.id} className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 text-lg">
                {group.groupName}
              </h3>
              <div className="flex flex-col items-end space-y-2 ml-4">
                {onEdit && (
                  <button
                    onClick={() => onEdit(group.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => onDelete(group.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  disabled={deletingId === group.id.toString()}
                >
                  {deletingId === group.id.toString() ? "Deleting..." : "Delete"}
                </button>
                {onApprove && group.approved === false && (
                  <button
                    onClick={() => onApprove(group)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium hover:bg-green-50 px-2 py-1 rounded transition-colors"
                    disabled={approvingId === group.id}
                  >
                    {approvingId === group.id ? "Approving..." : "Approve"}
                  </button>
                )}
                {group.approved && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Approved
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-xl font-bold text-gray-900 mb-4">
              Total: ₹{groupTotal.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
            
            <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded-lg">
              {group.lineItems.map((item) => {
                const { amount, gst, totalWithGst } = calculateItemTotal(item);

                return (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center text-sm bg-gray-50 px-3 py-1 rounded"
                  >
                    <span className="text-gray-600 truncate mr-2" title={item.fieldName}>
                      {item.fieldName}
                    </span>
                    <span className="text-gray-900 font-normal whitespace-nowrap">
                      ₹{totalWithGst.toLocaleString('en-IN', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                      {gst > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          (₹{amount.toLocaleString()} + {gst}%)
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Date Added:</span>
                <div className="text-gray-600">{formatDate(group.dateAdded)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Client Visible:</span>
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    group.showToClient 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {group.showToClient ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            {group.notes && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-700 text-sm">Notes:</span>
                <p className="text-sm text-gray-600 mt-1">{group.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EntriesMobileView;