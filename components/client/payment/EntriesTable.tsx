import React from "react";
import { EntryGroup } from "@/types/paymentDetails.types";
import { formatDate } from "@/utils/clientPaymentUtils";

interface EntriesTableProps {
  entries: EntryGroup[];
  onDelete: (id: number) => void;
  deletingId: string | null;
  onEdit: (id: number) => void;
  onApprove: (group: EntryGroup) => void;
  approvingId?: number | null;
}

const EntriesTable: React.FC<EntriesTableProps> = ({
  entries,
  onDelete,
  deletingId,
  onEdit,
  onApprove,
  approvingId,
}) => {

  console.log("Rendering EntriesTable with entries:", entries);
  return (
    <div className="hidden xl:block overflow-x-auto">
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
              Start & End Date
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
                  <div className="min-w-[200px]"> 
                    <div className="font-medium text-gray-900 mb-3">
                      {group.groupName}
                    </div>
                    
                    <div className="space-y-2">
                      {group.lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 px-3 py-2 rounded border border-slate-200"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <span className="text-sm text-gray-700 font-medium break-words">
                              {item.fieldName}
                            </span>
                            <span className="text-sm text-gray-900 font-bold whitespace-nowrap">
                              ₹{item.amountWithGst?.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>

                          {((item.gst ?? 0) > 0 || (item.commission ?? 0) > 0) && (
                            <div className="mt-1 flex flex-col items-end text-xs text-gray-500">
                              
                              {(item.gst ?? 0) > 0 && (
                                <span>
                                  (₹{item.amount.toLocaleString()} + {item.gst}% GST)
                                </span>
                              )}

                              {(item.commission ?? 0) > 0 && (
                                <span className="text-purple-600 font-medium mt-0.5">
                                  Commission: ₹{(item.commission ?? 0).toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              )}
                            </div>
                          )}
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
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col text-sm text-gray-600">
                    <span>
                      {group.startDate ? formatDate(group.startDate) : <span className="text-gray-400 italic">N/A</span>} <br /> to
                    </span>
                    <span>
                      {group.endDate ? formatDate(group.endDate) : <span className="text-gray-400 italic">N/A</span>}
                    </span>
                  </div>
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
                    onClick={() => onEdit(group.id)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded transition-colors mr-2"
                  >
                    Edit
                  </button>
                  {!group.approved && (
                    <button 
                      onClick={() => onApprove(group)}
                      className={`text-green-600 hover:text-green-900 text-sm font-medium hover:bg-green-50 px-3 py-1 rounded transition-colors mr-2 ${
                        approvingId === group.id ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={approvingId === group.id}
                    >
                      {approvingId === group.id ? "Approving..." : "Approve"}
                    </button>
                  )}
                  {group.approved && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                      Approved
                    </span>
                  )}
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