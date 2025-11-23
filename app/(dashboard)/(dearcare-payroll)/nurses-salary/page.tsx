"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Download, Loader2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/client/clients/PaginationControls";
import { fetchSalaryPaymentDebts, SalaryPaymentDebtRecord } from "@/app/actions/payroll/calculate-nurse-salary";

export default function NursesSalaryPage() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryPaymentDebtRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchSalaryData();
  }, [currentPage, pageSize, searchQuery]);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      const response = await fetchSalaryPaymentDebts({
        page: currentPage,
        pageSize,
        search: searchQuery
      });
      if (response.success) {
        setSalaryRecords(response.records);
        setTotalCount(response.total);
      } else {
        console.error("Failed to fetch salary data:", response.error);
        setSalaryRecords([]);
      }
    } catch (error) {
      console.error("Error fetching salary data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      setSearchQuery(searchInput);
    }, 500);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchInput]);

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
    }, 2000);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalCount / pageSize)));
  };

  return (
    <div className="container mx-auto py-1 space-y-6">
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Salary Payments</h2>
              <p className="text-xs text-gray-500">Manage nurse salary payments and calculations</p>
            </div>
            <div className="hidden gap-2 self-start sm:self-auto">
              <button 
                onClick={handleExport}
                disabled={isExporting || salaryRecords.length === 0}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isExporting ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-1 h-3 w-3" />
                    Exporting...
                  </span>
                ) : (
                  <>
                    <Download size={16} />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 space-y-3 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter search term"
                className="pl-9 pr-20 py-1 h-9 bg-white text-sm border-gray-200 focus-visible:ring-blue-400 text-gray-800 w-full"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button 
                  onClick={handleResetFilters}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded text-xs transition-colors"
                disabled
              >
                Search
              </button>
            </div>
          </div>
        </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8 min-h-[500px]">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading salary data...</span>
            </div>
          ) : salaryRecords.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nurse Details</th>
                  <th className="px-4 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
                  <th className="px-4 py-5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                  <th className="px-4 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debt</th>
                  <th className="px-4 py-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Instlmnt. Due</th>
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
                      <div className="flex flex-col  w-[100px]">
                        <span className="text-sm font-semibold text-gray-900">{record.full_name}</span>
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
                        {capitalizeFirst(record.payment_status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {record.total_outstanding_debt > 0 ? `₹${record.total_outstanding_debt}` : '-'}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {record.total_installments_due > 0 ? record.total_installments_due : '-'}
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {record.active_loan_count > 0 ? (
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
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
        {salaryRecords.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / pageSize)}
            totalCount={totalCount}
            pageSize={pageSize}
            itemsLength={salaryRecords.length}
            onPageChange={handlePageChange}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            setPageSize={setPageSize}
          />
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}