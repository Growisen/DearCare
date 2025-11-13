import React from "react";
import { EntryGroup } from "@/types/paymentDetails.types";
import { formatDate } from "@/utils/clientPaymentUtils";

interface EntriesTableProps {
  entries: EntryGroup[];
  onDelete: (id: number) => void;
  deletingId: string | null;
}

const EntriesTable: React.FC<EntriesTableProps> = ({
  entries,
  onDelete,
  deletingId,
}) => {

  console.log("Rendering EntriesTable with entries:", entries);
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Group & Fields
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Added
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mode of Payment
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client Visible
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((group) => {
            const groupTotal = group.lineItems.reduce(
              (sum, item) => sum + (item.amountWithGst ?? 0),
              0
            );

            return (
              <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 align-top">
                  <div className="max-w-xs">
                    <div className="font-medium text-gray-900 mb-2">
                      {group.groupName}
                    </div>
                    <div className="space-y-1">
                      {group.lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm bg-gray-50 px-3 py-1 rounded"
                        >
                          <span className="text-gray-600 truncate mr-2" title={item.fieldName}>
                            {item.fieldName}
                          </span>
                          <span className="text-gray-900 font-normal whitespace-nowrap">
                            ₹{item.amountWithGst?.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            {(item.gst ?? 0) > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                (₹{item.amount.toLocaleString()} + {(item.gst ?? 0)}% GST)
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 align-top text-right">
                  <span className="font-normal text-gray-900">
                    ₹{groupTotal.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 align-top text-sm text-gray-600">
                  {formatDate(group.dateAdded)}
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="max-w-xs">
                    {group.notes ? (
                      <span className="text-sm text-gray-600">{group.notes}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No notes</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <span className="text-sm text-gray-600">
                    {group.modeOfPayment || <span className="text-gray-400 italic">N/A</span>}
                  </span>
                </td>
                <td className="px-6 py-4 align-top text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    group.showToClient 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {group.showToClient ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 align-top text-center">
                  <button 
                    onClick={() => onDelete(group.id)} 
                    className="text-red-600 hover:text-red-900 text-sm font-medium hover:bg-red-50 px-3 py-1 rounded transition-colors"
                    disabled={deletingId === group.id.toString()}
                  >
                    {deletingId === group.id.toString() ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EntriesTable;