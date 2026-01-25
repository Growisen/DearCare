"use client";

import React from "react";
import Link from "next/link";
import { Search, ArrowUpRight, Info } from "lucide-react";
import { PaginationControls } from "@/components/client/clients/PaginationControls";
import { LoadingState } from '@/components/Loader';
import { formatDate, formatName } from "@/utils/formatters";
import { SalaryPaymentDebtRecord } from "@/types/nurse.salary.types";

interface NursesSalaryTableProps {
  salaryRecords: SalaryPaymentDebtRecord[];
  loading: boolean;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  handlePageChange: (page: number) => void;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  setPageSize: (size: number) => void;
}

export function NursesSalaryTable({
  salaryRecords,
  loading,
  searchQuery,
  currentPage,
  pageSize,
  totalCount,
  handlePageChange,
  handlePreviousPage,
  handleNextPage,
  setPageSize,
}: NursesSalaryTableProps) {
  return (
    <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden flex flex-col mt-4">
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="flex justify-center items-center p-8 min-h-[700px]">
            <LoadingState 
              message="Loading salary data..." 
              description="Please wait while we fetch the salary records data"
              className="xl:h-[770px] lg:h-[670px] md:h-[570px] sm:h-[470px] h-[370px]"
            />
          </div>
        ) : salaryRecords.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nurse Details</th>
                <th className="px-4 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
                <th className="px-4 py-5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-4 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Advance</th>
                <th className="px-4 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                <th className="px-4 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Loans</th>
                <th className="px-4 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">Info</th>
                <th className="px-4 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-4 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaryRecords.map((record) => (
                <tr key={record.salary_payment_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-wrap">
                    <div className="flex flex-col w-[150px]">
                      <Link
                        href={`/nurses/${record.nurse_id}`}
                        className="font-semibold text-sm text-gray-700 hover:underline inline-flex items-center gap-1"
                        target="_blank"
                        prefetch={false}
                        rel="noopener noreferrer"
                      >
                        {record.full_name}
                        <ArrowUpRight className="inline w-3.5 h-3.5 ml-1 text-blue-700" />
                      </Link>
                      <span className="text-xs text-gray-500">Reg: {record.nurse_reg_no}</span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col text-xs text-gray-600">
                      <span>{formatDate(record.pay_period_start)}</span>
                      <span className="text-gray-400 mx-1">to</span>
                      <span>{formatDate(record.pay_period_end)}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-gray-900">₹{record.net_salary.toLocaleString('en-IN')}</span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                      record.payment_status === "paid"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-yellow-50 text-yellow-700 border-yellow-100"
                    }`}>
                      {formatName(record.payment_status)}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {record.total_outstanding_debt > 0 ? `₹${record.total_outstanding_debt}` : '-'}
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {record.total_installments_due > 0 ? `₹${record.total_installments_due}` : '-'}
                  </td>
                  
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {record.active_loan_count > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 
                         text-gray-800"
                       >
                           {record.active_loan_count}
                        </span>
                    ) : '-'}
                  </td>

                  <td className="px-4 py-4 text-left align-middle">
                    <div className="w-[200px] flex items-center">
                      <div 
                        className="whitespace-wrap text-xs text-gray-500 cursor-help" 
                        title={record.info || "No additional info"}
                      >
                        {record.info || "-"}
                      </div>
                      {record.info && (
                          <Info size={12} className="text-gray-300 ml-1 flex-shrink-0" />
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-center text-xs text-gray-500">
                    {formatDate(record.created_at)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <a
                      href={`/nurses/salary-report?nurseId=${record.nurse_id}&payPeriodStart=${encodeURIComponent(record.pay_period_start)}&payPeriodEnd=${encodeURIComponent(record.pay_period_end)}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
               <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No records found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery ? `No salary records match "${searchQuery}"` : "There are no salary records available."}
            </p>
          </div>
        )}
      </div>
      <div className="border-t border-slate-200 bg-gray-50">
        <PaginationControls
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(totalCount / pageSize))}
          totalCount={totalCount}
          pageSize={pageSize}
          itemsLength={salaryRecords.length}
          onPageChange={handlePageChange}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
}