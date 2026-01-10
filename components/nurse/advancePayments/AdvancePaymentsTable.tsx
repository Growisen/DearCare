import React from "react";
import { 
	IoAdd, 
	IoTrash, 
	IoDocumentTextOutline, 
	IoTimeOutline, 
	IoCheckmarkCircleOutline 
} from "react-icons/io5";
import { formatDate } from "@/utils/formatters";

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
  payment_method?: string;
  receipt_url?: string | null;
  info?: string | null;
  approved: boolean;
};

interface AdvancePaymentsTableProps {
  payments: AdvancePayment[];
  loading: boolean;
  onViewHistory: (payment: AdvancePayment) => void;
  onAddInstallment: (payment: AdvancePayment) => void;
  onSendAdvanceAmount: (payment: AdvancePayment) => void;
  onDelete: (payment: AdvancePayment) => void;
}

const AdvancePaymentsTable: React.FC<AdvancePaymentsTableProps> = ({
  payments,
  loading,
  onViewHistory,
  onAddInstallment,
  onSendAdvanceAmount,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-sm mt-4">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider min-w-[130px]">
              Issue Date
            </th>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider min-w-[140px]">
              Advance Details
            </th>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider min-w-[180px]">
              Notes
            </th>
            <th scope="col" className="px-6 py-3 font-medium text-right tracking-wider">
              Total Repaid
            </th>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider">
              Plan
            </th>
            <th scope="col" className="px-6 py-3 font-medium text-right tracking-wider">
              Balance Due
            </th>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider text-center">
              History
            </th>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider text-center w-[160px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse bg-white">
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-slate-100 rounded w-12"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-slate-200 rounded w-16 mx-auto"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-8 bg-slate-200 rounded w-full"></div>
                </td>
              </tr>
            ))
          ) : payments.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-slate-400 bg-slate-50/50">
                No advance payment records found.
              </td>
            </tr>
          ) : (
            payments.map((payment) => {
              const historyCount = payment.deductions?.length || 0;
              return (
                <tr
                  key={payment.id}
                  className="bg-white hover:bg-slate-50 transition-colors duration-150 align-top"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium whitespace-nowrap">
                    {formatDate(payment.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">₹{payment.advance_amount}</div>
                    {payment.payment_method && (
                      <div className="text-xs text-slate-500 mt-0.5">{payment.payment_method}</div>
                    )}
                    {payment.receipt_url ? (
                      <a
                        href={payment.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-xs flex items-center gap-1 mt-1"
                      >
                        <IoDocumentTextOutline /> Receipt
                      </a>
                    ) : (
                      <div className="text-xs text-slate-400 mt-1">No receipt</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-600 whitespace-pre-wrap break-words max-w-[200px]">
                      {payment.info || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-emerald-600 font-medium">
                    {payment.return_amount ? `₹${payment.return_amount}` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    <div>{payment.return_type}</div>
                    {payment.installment_amount && (
                      <div className="text-xs text-slate-400 mt-0.5">₹{payment.installment_amount}/mo</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span
                      className={`font-bold ${
                        payment.remaining_amount > 0 ? "text-amber-600" : "text-slate-400"
                      }`}
                    >
                      {payment.remaining_amount ? `₹${payment.remaining_amount}` : "Paid"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewHistory(payment)}
                      className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border
                        ${
                          historyCount > 0
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <IoTimeOutline size={14} />
                      {historyCount > 0 ? `View (${historyCount})` : "History"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => onAddInstallment(payment)}
                        className="w-full px-2 py-1 text-xs font-medium text-center text-emerald-700 bg-white border border-emerald-200 rounded-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <IoAdd size={14} /> Repayment
                      </button>
                      {payment.approved ? (
                        <div className="w-full px-2 py-1 text-xs font-medium text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-center gap-1 cursor-default">
                          <IoCheckmarkCircleOutline className="text-green-500" /> Approved
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSendAdvanceAmount(payment)}
                          className="w-full px-2 py-1 text-xs font-medium text-center text-blue-700 bg-white border border-blue-200 rounded-sm hover:bg-blue-50 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(payment)}
                        className="w-full px-2 py-1 text-xs font-medium text-center text-red-600 bg-white border border-red-200 rounded-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <IoTrash size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdvancePaymentsTable;