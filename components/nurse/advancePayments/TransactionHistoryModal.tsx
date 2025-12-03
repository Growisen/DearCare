import React from "react";
import { 
  IoClose, 
  IoDocumentTextOutline, 
  IoArrowUp, 
  IoArrowDown, 
  IoWalletOutline, 
  IoCalendarOutline 
} from 'react-icons/io5';
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  payment: AdvancePayment | null;
};

export default function TransactionHistoryModal({
  isOpen,
  onClose,
  payment,
}: Props) {
  if (!isOpen || !payment) return null;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(amount);

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        
        <div className="bg-white border border-gray-300 rounded-lg w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
          
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <IoWalletOutline className="text-slate-500" /> 
                Transaction History
              </h3>
              {/* <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                Reference ID: #{payment.id.slice(-6)}
              </p> */}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-slate-500 hover:text-slate-800"
            >
              <IoClose size={22} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-px bg-gray-200 border-b border-gray-200">
            <div className="bg-white p-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Advance</p>
              <p className="text-2xl font-medium text-slate-800">{formatCurrency(payment.advance_amount)}</p>
              {/* <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400">Date Issued:</span>
                <span className="text-xs text-slate-600 font-medium">
                   {payment.date ? formatDate(payment.date) : "Not entered"}
                </span>
              </div> */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-600 font-medium">
                   Advance Given 
                </span>
              </div>
            </div>

            <div className="bg-white p-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Current Balance
              </p>
              <p className="text-2xl font-medium text-slate-800">{formatCurrency(payment.remaining_amount)}</p>
              <p className="text-xs text-slate-500 mt-2">
                {payment.remaining_amount > 0 ? 'Outstanding Amount' : 'Settled'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-6">
            {Array.isArray(payment.deductions) && payment.deductions.length > 0 ? (
              <div className="space-y-0 divide-y divide-gray-100 border border-gray-200 rounded-lg">
                {payment.deductions.map((d: Deduction, idx: number) => {
                  const isMoneyGiven = d.lend !== undefined && d.lend > 0;
                  const amount = isMoneyGiven ? d.lend : d.amount_paid ?? 0;
                  
                  return (
                    <div 
                      key={idx} 
                      className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 ${
                          isMoneyGiven 
                            ? 'bg-amber-50 border-amber-200 text-amber-600' 
                            : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                          {isMoneyGiven ? <IoArrowUp size={18} /> : <IoArrowDown size={18} />}
                        </div>
                        
                        <div className="space-y-1">
                          <h5 className="font-semibold text-slate-700 text-sm">
                            {isMoneyGiven ? "Additional Advance" : "Repayment Received"}
                          </h5>
                          
                          <div className="grid grid-cols-1 gap-1 mt-1">
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <span className="text-slate-400 w-16">Date:</span> 
                              {d.date ? formatDate(d.date) : "Not entered"}
                            </p>
                            
                            {isMoneyGiven && (
                              <p className="text-xs text-slate-600 flex items-center gap-1">
                                <span className="text-slate-400 w-16">Payment Method:</span> 
                                {d.payment_method || "Not entered"}
                              </p>
                            )}

                            <p className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-slate-400 w-16 shrink-0">Notes:</span> 
                              <span className="leading-tight">
                                {d.info || "Not entered"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start pl-14 sm:pl-0 gap-2">
                        <div className="text-right">
                          <p className={`font-medium text-base ${isMoneyGiven ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {isMoneyGiven ? '+' : '-'} {formatCurrency(amount || 0)}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-1">
                            Balance: {formatCurrency(d.remaining)}
                          </p>
                        </div>

                        {d.receipt_file ? (
                          <a 
                            href={d.receipt_file} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline hover:text-blue-800 mt-1"
                          >
                            <IoDocumentTextOutline size={14} />
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 mt-1">Not receipt available</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-gray-200 border-dashed rounded-lg bg-gray-50">
                <IoCalendarOutline size={32} className="text-gray-300 mb-3" />
                <p className="text-slate-600 font-medium text-sm">No transactions found</p>
                <p className="text-xs text-slate-400 mt-1">Record entries will appear here.</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white border border-gray-300 text-slate-700 font-medium rounded text-sm hover:bg-gray-100 hover:border-gray-400 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}