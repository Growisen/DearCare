import React from "react";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import { SalaryPayment } from "../types";

interface PaymentHistoryTableProps {
  payments: SalaryPayment[];
  nurseId: number;
  recalculatingId: number | null;
  onOpenCreateModal: () => void;
  onOpenConfirmModal: (payment: SalaryPayment) => void;
  onOpenBonusModal: (payment: SalaryPayment) => void;
  onOpenDeductionModal: (payment: SalaryPayment) => void;
  handleApprove: (payment: SalaryPayment) => void;
  approvingId?: number | null;
  loading?: boolean;
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  nurseId,
  recalculatingId,
  onOpenCreateModal,
  onOpenConfirmModal,
  onOpenBonusModal,
  onOpenDeductionModal,
  handleApprove,
  approvingId,
  loading,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-sm">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Payment History</h3>
          <p className="text-sm text-slate-500 mt-1">
            Manage salary disbursements and adjustments.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-sm transition-colors"
        >
          Create Salary
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium tracking-wider min-w-[160px]">
                Pay Period & Notes
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-right tracking-wider">
                Work Hours
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-right tracking-wider">
                Hourly Pay
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-right tracking-wider">
                Salary Generated
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-right tracking-wider">
                Net Salary
              </th>
              <th scope="col" className="px-6 py-3 font-medium tracking-wider min-w-[140px]">
                Status
              </th>
              <th scope="col" className="px-6 py-3 font-medium tracking-wider text-center w-[160px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse bg-white">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-20"></div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-end gap-1">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                      <div className="h-3 bg-slate-100 rounded w-12"></div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <div className="h-5 bg-slate-300 rounded w-24"></div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                    <div className="h-3 bg-slate-100 rounded w-32 mt-2"></div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="h-8 bg-slate-200 rounded w-full"></div>
                      <div className="flex gap-1.5">
                        <div className="h-7 bg-slate-100 rounded flex-1"></div>
                        <div className="h-7 bg-slate-100 rounded flex-1"></div>
                      </div>
                      <div className="h-7 bg-slate-100 rounded w-full"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 bg-slate-50/50">
                  No payment records found.
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const isGreenStatus =
                  payment.paymentStatus === "Paid" ||
                  payment.paymentStatus === "Approved";

                const isPending =
                  payment.paymentStatus === "pending" ||
                  payment.paymentStatus === "Pending";

                return (
                  <tr
                    key={payment.id}
                    className="bg-white hover:bg-slate-50 transition-colors duration-150 align-top"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 whitespace-nowrap">
                        {formatDateToDDMMYYYY(payment.payPeriodStart)} —{" "}
                        {formatDateToDDMMYYYY(payment.payPeriodEnd)}
                      </div>
                      {payment.info && (
                        <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-sm text-xs text-slate-600 whitespace-normal break-words">
                          <span className="font-semibold text-slate-500 block mb-1">
                            Note:
                          </span>
                          {payment.info}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-slate-900">{payment.daysWorked} days</div>
                      <div className="text-xs text-slate-500">
                        {payment.hoursWorked} hrs
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap text-slate-600">
                      ₹{payment.averageHourlyRate?.toLocaleString() ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap text-slate-600">
                      ₹{payment.salary?.toLocaleString() ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="font-semibold text-slate-900">
                        ₹{payment.netSalary?.toLocaleString() ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium border ${
                            isGreenStatus
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {payment.paymentStatus}
                        </span>

                        {payment.paymentMethod && (
                          <div className="text-xs text-slate-500 whitespace-normal break-words w-full">
                            <div className="font-medium text-slate-700">
                              {payment.paymentMethod}
                            </div>
                            {payment.transactionReference && (
                              <div className="mt-1 text-slate-400 break-all">
                                Ref: {payment.transactionReference}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <a
                          href={`/nurses/salary-report?nurseId=${nurseId}&payPeriodStart=${encodeURIComponent(
                            payment.payPeriodStart
                          )}&payPeriodEnd=${encodeURIComponent(
                            payment.payPeriodEnd
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-2 py-1 text-xs font-medium text-center text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 transition-colors"
                        >
                          View Report
                        </a>

                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleApprove(payment)}
                            disabled={approvingId === payment.id}
                            className="w-full px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            {approvingId === payment.id
                              ? "Approving..."
                              : "Approve"}
                          </button>
                        )}

                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenBonusModal(payment)}
                            className="flex-1 px-2 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-sm hover:bg-blue-50 transition-colors"
                          >
                            Bonus
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDeductionModal(payment)}
                            className="flex-1 px-2 py-1 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-sm hover:bg-red-50 transition-colors"
                          >
                            Deduction
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenConfirmModal(payment)}
                          disabled={recalculatingId === payment.id}
                          className="w-full px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          {recalculatingId === payment.id
                            ? "Recalculating..."
                            : "Recalculate"}
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
    </div>
  );
};

export default PaymentHistoryTable;