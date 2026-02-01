import React from "react";
// Remove all icon imports except IoTrash, IoCheckmarkCircleOutline, IoDocumentTextOutline
import { 
  IoTrash, 
  IoDocumentTextOutline, 
  IoCheckmarkCircleOutline,
  IoPencil // Add IoPencil for edit button
} from "react-icons/io5";
import { formatDate } from "@/utils/formatters";

export type AdvancePayment = {
  id: string;
  nurse_id: number;
  date: string;
  amount: number;
  transactionType: 'ADVANCE' | 'REPAYMENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  returnType?: 'full' | 'installments' | null;
  installmentAmount?: number | null;
  paymentMethod?: string | null;
  receiptUrl?: string | null;
  info?: string | null; 
  createdAt?: string;
};

interface AdvancePaymentsTableProps {
  payments: AdvancePayment[];
  loading: boolean;
  onApprove: (payment: AdvancePayment) => void;
  onDelete: (payment: AdvancePayment) => void;
  onEdit?: (payment: AdvancePayment) => void;
}

const AdvancePaymentsTable: React.FC<AdvancePaymentsTableProps> = ({
  payments,
  loading,
  onApprove,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-sm shadow-sm bg-white">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider w-[140px]">
              Transaction Date
            </th>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider w-[130px]">
              Type
            </th>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider w-[140px]">
              Method
            </th>
            <th scope="col" className="px-6 py-3 font-medium tracking-wider">
              Details & Repayment Plan
            </th>
            <th scope="col" className="px-6 py-3 font-medium text-right tracking-wider w-[140px]">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 font-medium text-center tracking-wider w-[140px]">
              Status
            </th>
            <th scope="col" className="px-6 py-3 font-medium text-center tracking-wider w-[120px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse bg-white">
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-24 mx-auto"></div></td>
                <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-full"></div></td>
              </tr>
            ))
          ) : payments.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-slate-400 bg-slate-50/50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <IoDocumentTextOutline size={24} className="opacity-50" />
                  <span>No payment records found.</span>
                </div>
              </td>
            </tr>
          ) : (
            payments.map((payment) => {
              const isAdvance = payment.transactionType === 'ADVANCE';
              const rowClass = isAdvance 
                ? "bg-amber-50/20 hover:bg-amber-50/30"
                : "bg-emerald-50/30 hover:bg-emerald-50/60";

              return (
                <tr
                  key={payment.id}
                  className={`${rowClass} transition-colors duration-150 align-top border-b border-slate-100 last:border-0`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-slate-700 font-medium">
                      {payment.date ? formatDate(payment.date) : "N/A"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`
                      inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                      ${isAdvance ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}
                    `}>
                      {isAdvance ? "Advance" : "Repayment"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <span>
                        {payment.paymentMethod || "N/A"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold mr-1">Description:</span>
                        {payment.info || <span className="text-slate-400 italic">No description provided</span>}
                      </div>

                      {isAdvance && (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs px-2 py-1">
                          <span className="font-semibold text-slate-600">Repayment Details:</span>
                          <span className="text-slate-500">
                            Type: <span className="font-medium text-slate-700 capitalize">{payment.returnType || "Not Set"}</span>
                          </span>
                          {payment.returnType === 'installments' && payment.installmentAmount && (
                            <span className="text-slate-500">
                              Installment: <span className="font-medium text-slate-700">₹{payment.installmentAmount}/mo</span>
                            </span>
                          )}
                        </div>
                      )}

                      {payment.receiptUrl && (
                        <a
                          href={payment.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 w-fit px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] hover:bg-blue-100 transition-colors border border-blue-100 mt-1"
                        >
                          <IoDocumentTextOutline />
                          View Receipt
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className={`text-sm font-bold ${isAdvance ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {isAdvance ? "+" : "-"} ₹{payment.amount?.toLocaleString() || "0"}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`
                        inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border
                        ${payment.status === 'APPROVED' || payment.status === 'COMPLETED' 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : payment.status === 'REJECTED'
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }
                      `}
                    >
                        {payment.status === 'APPROVED' && <IoCheckmarkCircleOutline size={12} />}
                        {payment.status || "UNKNOWN"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-center">
                      {payment.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => onApprove(payment)}
                          className="w-full max-w-[100px] px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                           <IoCheckmarkCircleOutline /> Approve
                        </button>
                      )}
                      
                      {payment.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => onEdit && onEdit(payment)}
                          className="hidden w-full max-w-[100px] px-2 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <IoPencil size={12} /> Edit
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => onDelete(payment)}
                        className="w-full max-w-[100px] px-2 py-1 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-1 opacity-75 hover:opacity-100 shadow-sm"
                      >
                        <IoTrash size={12} /> Delete
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