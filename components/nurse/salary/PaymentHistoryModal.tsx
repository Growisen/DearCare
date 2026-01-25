import React from "react";
import { formatDate } from "@/utils/formatters";

export interface PaymentHistoryEntry {
  status: string;
  amount: number;
  payment_type: string | null;
  info: string;
  approved_at: string;
  paid_at: string;
  created_at: string;
}

interface PaymentHistoryModalProps {
  history: PaymentHistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  history,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h4 className="text-lg font-semibold text-slate-900">
            Full Payment History Log
          </h4>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No history records found for this payment.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-sm p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                          entry.status === "approved" || entry.status === "paid"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {entry.status}
                      </span>
                      <span className="text-sm text-slate-500">
                        {entry.created_at
                          ? formatDate(entry.created_at, true)
                          : "Unknown Date"}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900">
                      ₹{Number(entry.amount).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                    <div>
                      <span className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                        Payment Type:
                      </span>{" "}
                      {entry.payment_type || "—"}
                    </div>
                    {entry.paid_at && (
                       <div>
                       <span className="font-medium text-slate-500 text-xs uppercase tracking-wide">
                         Paid At:
                       </span>{" "}
                       {formatDate(entry.paid_at, true)}
                     </div>
                    )}
                  </div>

                  {entry.info && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-800 mr-1">Note:</span>
                        {entry.info}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-sm flex justify-end">
          <button
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-sm hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;