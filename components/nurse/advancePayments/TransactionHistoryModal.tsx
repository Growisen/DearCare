import React from "react";
import { IoClose, IoDocumentTextOutline, IoArrowUp, IoArrowDown } from 'react-icons/io5';
import { formatDate } from "@/utils/formatters";
import ModalPortal from "@/components/ui/ModalPortal";

type Deduction = {
  date: string;
  amount_paid?: number;
  lend?: number;
  remaining: number;
  type?: string;
  payment_method?: string;
  receipt_file?: string | null;
  info?: string | null;
};

type AdvancePayment = {
  id: string;
  date: string;
  advance_amount: number;
  status?: string;
  return_type: string;
  return_amount?: number;
  installment_amount?: number;
  remaining_amount: number;
  deductions?: Deduction[];
  actions?: React.ReactNode;
  payment_method?: string;
  receipt_url?: string | null;
};

export default function TransactionHistoryModal({
  isOpen,
  onClose,
  payment,
}: {
  isOpen: boolean;
  onClose: () => void;
  payment: AdvancePayment | null;
}) {
  if (!isOpen || !payment) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
              <p className="text-xs text-gray-500">
                Advance Date: {formatDate(payment.date)} | Amount: ₹{payment.advance_amount}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <IoClose size={24} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto">
            {Array.isArray(payment.deductions) && payment.deductions.length > 0 ? (
              <div className="border border-gray-100 rounded-md bg-white overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-3 text-left font-medium border-b border-gray-100 whitespace-nowrap">Date</th>
                      <th className="py-2 px-3 text-left font-medium border-b border-gray-100 whitespace-nowrap">Type</th>
                      <th className="py-2 px-3 text-right font-medium border-b border-gray-100 whitespace-nowrap">Amount</th>
                      <th className="py-2 px-3 text-left font-medium border-b border-gray-100 w-[250px]">Info</th>
                      <th className="py-2 px-3 text-center font-medium border-b border-gray-100 w-[50px]">Doc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payment.deductions.map((d: Deduction, idx: number) => {
                      const isLend = d.lend !== undefined && d.lend > 0;
                      const amount = isLend ? d.lend : d.amount_paid ?? 0;
                      return (
                        <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                          <td className="py-2 px-3 text-gray-600 whitespace-nowrap align-top">
                            {formatDate(d.date)}
                          </td>
                          <td className="py-2 px-3 align-top">
                            <div className="flex flex-col">
                              <span className={`font-medium ${isLend ? 'text-orange-600' : 'text-gray-700'}`}>
                                {(isLend ? "Extra Lend" : "Paid Return")}
                              </span>
                              <span className="text-[10px] text-gray-400">Bal: ₹{d.remaining}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right whitespace-nowrap align-top">
                            <div className={`flex items-center justify-end gap-1 font-medium ${isLend ? 'text-orange-600' : 'text-green-600'}`}>
                              {isLend ? <IoArrowUp size={12} /> : <IoArrowDown size={12} />}
                              ₹{amount}
                            </div>
                          </td>
                          
                          <td className="py-2 px-3 align-top">
                             <div className="w-[250px] whitespace-normal break-words text-gray-600 leading-tight">
                                {d.info || <span className="text-gray-300 italic">-</span>}
                             </div>
                          </td>

                          <td className="py-2 px-3 text-center align-top">
                            {d.receipt_file && (
                              <a 
                                href={d.receipt_file} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                title="View Receipt"
                              >
                                <IoDocumentTextOutline size={14} />
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded border border-dashed border-gray-200">
                No transaction history found for this payment.
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-lg flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}