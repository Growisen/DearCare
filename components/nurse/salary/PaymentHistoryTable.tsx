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
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  nurseId,
  recalculatingId,
  onOpenCreateModal,
  onOpenConfirmModal,
  onOpenBonusModal,
  onOpenDeductionModal,
}) => {
  return (
    <div className="bg-white rounded border border-gray-300 p-3 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Payment History
        </h3>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded shadow"
          onClick={onOpenCreateModal}
        >
          Create Salary
        </button>
      </div>
      <table className="min-w-full text-sm border-collapse border border-gray-300 text-gray-800">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="border border-gray-300 px-4 py-2 text-left">Pay Period</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Days Worked</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Hours Worked</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Avg Hourly Rate (₹)</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Salary (₹)</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Net Salary (₹)</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Payment Details</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Info</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-8 text-gray-500">
                No payment history available.
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="border border-gray-300 px-4 py-2">
                  {formatDateToDDMMYYYY(payment.payPeriodStart)} → {formatDateToDDMMYYYY(payment.payPeriodEnd)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">{payment.daysWorked}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{payment.hoursWorked}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  ₹ {payment.averageHourlyRate?.toLocaleString() ?? "—"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  ₹ {payment.salary?.toLocaleString() ?? "—"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  <span className="font-semibold text-gray-900">
                    ₹ {payment.netSalary?.toLocaleString() ?? "—"}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold w-fit ${
                        payment.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                      title={payment.paymentStatus === "Paid" ? "Payment completed" : "Payment pending"}
                    >
                      {payment.paymentStatus}
                    </span>
                    <span className="text-gray-700 text-xs" title={payment.paymentMethod}>
                      {payment.paymentMethod || <span className="text-gray-400">—</span>}
                    </span>
                    <span className="text-gray-500 text-xs truncate" title={payment.transactionReference}>
                      {payment.transactionReference || <span className="text-gray-400">—</span>}
                    </span>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {payment.info ? (
                    <span
                      className="text-gray-800"
                      title={payment.info}
                    >
                      {payment.info}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <a
                      href={`/nurses/salary-report?nurseId=${nurseId}&payPeriodStart=${encodeURIComponent(payment.payPeriodStart)}&payPeriodEnd=${encodeURIComponent(payment.payPeriodEnd)}`}
                      className="text-blue-600 hover:underline text-xs"
                      title="View Report"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Details
                    </a>
                    <button
                      type="button"
                      className="text-indigo-600 hover:underline text-xs hover:bg-indigo-50 rounded px-2 py-1"
                      title="Recalculate Salary"
                      disabled={recalculatingId === payment.id}
                      onClick={() => onOpenConfirmModal(payment)}
                    >
                      {recalculatingId === payment.id ? "Recalculating..." : "Recalculate"}
                    </button>
                    <button
                      type="button"
                      className="text-green-600 hover:underline text-xs hover:bg-green-50 rounded px-2 py-1"
                      title="Add Bonus"
                      onClick={() => onOpenBonusModal(payment)}
                    >
                      Add Bonus
                    </button>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-green-600 hover:text-green-900 text-xs hover:underline mt-1 disabled:opacity-60"
                    >
                        Approve
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline text-xs hover:bg-green-50 rounded px-2 py-1"
                      title="Add Deduction"
                      onClick={() => onOpenDeductionModal(payment)}
                    >
                      Deduction
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistoryTable;