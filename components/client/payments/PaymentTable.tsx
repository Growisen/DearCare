import React from "react"
import { formatDate } from "@/utils/formatters";
import { formatName } from "@/utils/formatters";

type AssignedNurse = {
  nurseId: number;
  name: string;
  regNo: string | null;
  startDate: string;
  endDate: string | null;
};

type Payment = {
  id: string;
  clientName: string;
  groupName: string;
  amount: number;
  date: string;
  modeOfPayment?: string;
  assignedNurses?: AssignedNurse[];
};

type PaymentTableProps = {
  payments: Payment[]
}

function renderNurses(nurses?: AssignedNurse[]) {
  if (!nurses || nurses.length === 0) return <span className="text-gray-400">None</span>;
  return (
    <ul className="space-y-1">
      {nurses.map(nurse => (
        <li key={nurse.nurseId} className="text-xs text-gray-700">
          <span className="font-medium">{formatName(nurse.name)}</span>
          {nurse.regNo && <span className="ml-1 text-gray-500">({nurse.regNo})</span>}
          <span className="ml-2 text-gray-400">
            {formatDate(nurse.startDate)} - {nurse.endDate ? formatDate(nurse.endDate) : "Present"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function PaymentTable({ payments }: PaymentTableProps) {
  return (
    <div className="w-full mx-auto">
      <div className="hidden md:block bg-gray-50 rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr className="text-left">
                <th className="py-4 px-6 font-medium text-gray-700">Client Name</th>
                <th className="py-4 px-6 font-medium text-gray-700">Group</th>
                <th className="py-4 px-6 font-medium text-gray-700">Amount</th>
                <th className="py-4 px-6 font-medium text-gray-700">Date</th>
                <th className="py-4 px-6 font-medium text-gray-700">Mode</th>
                <th className="py-4 px-6 font-medium text-gray-700">Assigned Nurses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-800 font-medium">{formatName(payment.clientName) || "N/A"}</td>
                    <td className="py-4 px-6 text-gray-600">{payment.groupName || "N/A"}</td>
                    <td className="py-4 px-6 text-gray-800 font-semibold">₹{payment.amount.toLocaleString() || "N/A"}</td>
                    <td className="py-4 px-6 text-gray-600">{formatDate(payment.date) || "N/A"}</td>
                    <td className="py-4 px-6 text-gray-600">{payment.modeOfPayment || "N/A"}</td>
                    <td className="py-4 px-6">{renderNurses(payment.assignedNurses)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-1">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div 
              key={payment.id} 
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-gray-900 font-semibold text-lg">
                    {payment.clientName || "N/A"}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {payment.groupName || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-bold text-xl">
                    ₹{payment.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">
                    {payment.date || "N/A"}
                  </span>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-gray-700 text-xs font-medium">
                    {payment.modeOfPayment || "N/A"}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="block text-xs font-semibold text-gray-700 mb-1">Assigned Nurses:</span>
                {renderNurses(payment.assignedNurses)}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No payments found</p>
          </div>
        )}
      </div>
    </div>
  )
}