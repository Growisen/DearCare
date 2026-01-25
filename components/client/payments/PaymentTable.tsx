import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, formatName } from "@/utils/formatters";

type AssignedNurse = {
  nurseId: number;
  name: string;
  regNo: string | null;
  startDate: string;
  endDate: string | null;
};

type Payment = {
  id: string;
  clientId: string;
  clientName: string;
  groupName: string;
  amount: number;
  date: string;
  startDate?: string;
  endDate?: string;
  modeOfPayment?: string;
  assignedNurses?: AssignedNurse[];
  paymentType?: string;
};

type PaymentTableProps = {
  payments: Payment[];
};

function renderServicePeriod(start?: string, end?: string) {
  if (!start) return <span className="text-gray-400">N/A</span>;
  
  return (
    <div className="flex flex-col text-sm items-center">
      <span className="text-gray-700 whitespace-nowrap">
        {formatDate(start)}
      </span>
      <span className="flex justify-center w-full text-gray-700 font-medium">
        to
      </span>
      <span className="text-gray-700">
        {end ? formatDate(end) : "Present"}
      </span>
    </div>
  );
}

function renderNurses(nurses?: AssignedNurse[]) {
  if (!nurses || nurses.length === 0) return <span className="text-gray-400">N/A</span>;
  return (
    <ul className="space-y-2">
      {nurses.map((nurse, idx) => (
        <li key={`${nurse.nurseId}-${nurse.startDate}-${idx}`} className="text-sm text-gray-700 leading-tight">
          <span className="font-medium block">{formatName(nurse.name)}</span>
          {nurse.regNo && (
            <span className="block text-gray-500 text-xs mb-0.5">
              Reg No: {nurse.regNo}
            </span>
          )}
          <span className="text-gray-400 text-xs">
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
      <div className="hidden md:block bg-gray-50 rounded-sm border border-slate-200 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-slate-200">
              <tr className="text-left text-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold text-gray-600">Client</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Group</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Amount</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Service Period</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Method</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Assignments</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Paid On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-800 font-medium">
                      <Link
                        href={`/client-profile/${payment.clientId}`}
                        prefetch={false}
                        className="font-medium text-gray-700 hover:underline inline-flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {formatName(payment.clientName) || "N/A"}
                        <ArrowUpRight className="inline w-3.5 h-3.5 ml-1 text-blue-700" />
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {payment.groupName || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-gray-800 font-semibold">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      {renderServicePeriod(payment.startDate, payment.endDate)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {payment.modeOfPayment || "N/A"}
                      </span>
                      {payment.paymentType && (
                        <>
                          <br />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {payment.paymentType}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {renderNurses(payment.assignedNurses)}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatDate(payment.date) || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="md:hidden space-y-3">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-sm border border-slate-200 p-4 shadow-none"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-gray-900 font-semibold text-lg">
                    <Link
                      href={`/client-profile/${payment.clientId}`}
                      className="font-medium text-gray-700 hover:underline inline-flex items-center gap-1"
                      target="_blank"
                      prefetch={false}
                      rel="noopener noreferrer"
                    >
                      {payment.clientName || "N/A"}
                      <ArrowUpRight className="inline w-3.5 h-3.5 ml-1 text-blue-700" />
                    </Link>
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {payment.groupName || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 font-bold text-lg">
                    ₹{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Paid: {formatDate(payment.date)}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-200 my-3"></div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                <div className="col-span-2">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Service Period
                  </span>
                  <div className="bg-gray-50 p-2 rounded text-gray-700 text-sm flex items-center gap-2">
                    <span>{payment.startDate ? formatDate(payment.startDate) : "N/A"}</span>
                    <span className="text-gray-400">→</span>
                    <span>{payment.endDate ? formatDate(payment.endDate) : "Present"}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Method
                  </span>
                  <span className="text-gray-800">{payment.modeOfPayment || "N/A"}</span>
                </div>
                <div className="col-span-2 mt-2">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Nurses
                  </span>
                  {renderNurses(payment.assignedNurses)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-sm border border-slate-200 p-8 text-center">
            <p className="text-gray-500">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
}