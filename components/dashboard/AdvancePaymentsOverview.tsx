"use client";

import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { CreditCard, Download, Search } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { PaginationControls } from "@/components/client/clients/PaginationControls";

type AdvancePayment = {
  id: number;
  date: string;
  advance_amount: number;
  return_type: string;
  return_amount: number;
  remaining_amount: number;
  installment_amount: number;
  info?: string;
  payment_method?: string;
  receipt_url?: string | null;
  approved?: boolean;
  nurse_id?: number;
  nurse_name: string;
  nurse_admitted_type: string;
  nurse_reg_no?: string;
  nurse_prev_reg_no?: string;
};

export default function AdvancePaymentsOverview({
  payments = [],
  loading = false,
  totalRecords,
  page,
  pageSize,
  totalGiven,
  totalReturned,
  totalPages,
  onPageChangeAction,
  onPreviousPageAction,
  onNextPageAction,
  setPageSizeAction,
  searchTerm,
  setSearchTermAction,
  onExportAction,
  exporting = false,
}: {
  payments: AdvancePayment[],
  loading?: boolean,
  totalRecords?: number,
  page?: number,
  pageSize?: number,
  totalGiven?: number,
  totalReturned?: number,
  totalPages?: number,
  exporting?: boolean,
  onPageChangeAction?: (page: number) => void,
  onPreviousPageAction?: () => void,
  onNextPageAction?: () => void,
  setPageSizeAction?: (size: number) => void,
  searchTerm?: string,
  setSearchTermAction?: (term: string) => void,
  onExportAction?: () => void
}) {

  const cachedStats = useRef({
    totalRecords: 0,
    totalGiven: 0,
    totalReturned: 0,
    totalPages: 1
  });

  if (!loading && totalRecords !== undefined) {
    cachedStats.current = {
      totalRecords: totalRecords || 0,
      totalGiven: totalGiven || 0,
      totalReturned: totalReturned || 0,
      totalPages: totalPages || 1,
    };
  }

  const displayTotalRecords = loading ? cachedStats.current.totalRecords : (totalRecords || 0);
  const displayTotalGiven = loading ? cachedStats.current.totalGiven : (totalGiven || 0);
  const displayTotalReturned = loading ? cachedStats.current.totalReturned : (totalReturned || 0);
  const displayTotalPages = loading ? cachedStats.current.totalPages : (totalPages || 1);

  return (
    <Card className="p-3 sm:p-4 bg-white border border-slate-200 shadow-sm rounded-lg mt-6">
      <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center sm:items-center justify-between mb-3 sm:mb-4 border-b border-slate-200 pb-2">
        <div className="flex items-center mb-2 xs:mb-0 sm:mb-0">
          <CreditCard className="w-5 h-5 text-slate-700 mr-2" />
          <h3 className="text-sm sm:text-md font-medium text-slate-800">
            Advance Payments Overview
          </h3>
        </div>
        <div className="flex flex-col w-full sm:flex-row sm:w-auto items-stretch sm:items-center gap-3">
          <div className="relative flex items-center">
            <input
              type="text"
              className="pl-8 pr-3 py-1.5 sm:py-2 text-xs text-gray-800 sm:text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search by nurse or info..."
              value={searchTerm ?? ""}
              onChange={e => setSearchTermAction && setSearchTermAction(e.target.value)}
            />
            <Search className="absolute left-2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <button
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            onClick={onExportAction}
            disabled={exporting}
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Exporting..." : "Export"}</span>
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-6 flex-wrap">
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Total Records:</span> {displayTotalRecords}
        </div>
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Total Advance Given:</span> ₹
          {displayTotalGiven.toLocaleString()}
        </div>
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Total Advance Returned:</span> ₹
          {displayTotalReturned.toLocaleString()}
        </div>
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Total Advance To Be Returned:</span> ₹
          {(displayTotalGiven - displayTotalReturned).toLocaleString()}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-3 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Date
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Name
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Reg No
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Advance Given
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Returned Amount
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                To Be Returned
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                Installment
              </th>
              <th
                className="py-3 px-4 text-sm font-semibold text-slate-600 whitespace-normal break-words max-w-[140px]"
              >
                Status / Info
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  {Array.from({ length: 8 }).map((_, colIdx) => (
                    <td key={colIdx} className="py-3 px-4">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center">
                  <div className="bg-slate-50 border border-slate-200 text-slate-600 px-6 py-5 rounded-md">
                    <p className="text-lg font-medium mb-1">No payments found</p>
                    <p className="text-sm">
                      No advance payments match your search criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                return (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(payment.date)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-800 whitespace-nowrap">
                      {payment.nurse_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                      <div>
                        <div>
                          <span className="font-semibold">Reg:</span>{" "}
                          {payment.nurse_reg_no || "-"}
                        </div>
                        <div>
                          <span className="font-semibold">Prev:</span>{" "}
                          {payment.nurse_prev_reg_no || "-"}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                      ₹{payment.advance_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                      {payment.return_amount ? `₹${payment.return_amount.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-red-600 font-medium whitespace-nowrap">
                      {payment.remaining_amount > 0
                        ? `₹${payment.remaining_amount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                      {payment.installment_amount > 0
                        ? `₹${payment.installment_amount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-normal break-words max-w-[140px]">
                      <div className="flex flex-col gap-1">
                        <span className="flex text-slate-500">{payment.info || "-"}</span>
                        <span
                          className={`inline-flex max-w-fit items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${payment.approved
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          {payment.approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={page ?? 1}
        totalPages={displayTotalPages}
        totalCount={displayTotalRecords}
        pageSize={pageSize ?? 10}
        itemsLength={loading ? pageSize ?? 10 : payments.length}
        onPageChange={onPageChangeAction!}
        onPreviousPage={onPreviousPageAction!}
        onNextPage={onNextPageAction!}
        setPageSize={setPageSizeAction!}
      />
    </Card>
  );
}