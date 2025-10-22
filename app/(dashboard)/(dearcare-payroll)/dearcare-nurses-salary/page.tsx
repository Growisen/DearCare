"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Download, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/client/clients/PaginationControls";
import { fetchSalaryPaymentsWithNurseInfo, SalaryPaymentRecord } from "@/app/actions/payroll/calculate-nurse-salary";

export default function NursesSalaryPage() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchSalaryData();
  }, [currentPage, pageSize, searchQuery]);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      const response = await fetchSalaryPaymentsWithNurseInfo({
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

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchQuery(searchInput);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    setIsExporting(true);
    // Implement export functionality here
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
        {/* Header with search and export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Salary Payments</h2>
            <p className="text-xs text-gray-500">Manage nurse salary payments and calculations</p>
          </div>
          <div className="hidden  gap-2 self-start sm:self-auto">
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

        {/* Search section */}
        <div className="p-4 bg-gray-50 space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by nurse name or registration number..."
              className="pl-9 pr-20 py-1 h-9 bg-white text-sm border-gray-200 focus-visible:ring-blue-400 text-gray-800 w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded text-xs transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading salary data...</span>
            </div>
          ) : salaryRecords.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nurse
                  </th>
                  <th scope="col" className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Pay Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary (₹)
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary (₹)
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaryRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{record.name}</div>
                      <div className="text-xs text-gray-500">{record.nurse_reg_no}</div>
                    </td>
                    <td className="px-1 py-4 text-center text-gray-500">
                      <div className="text-sm">
                        {formatDate(record.pay_period_start)} - {formatDate(record.pay_period_end)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {record.days_worked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {record.hours_worked}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      ₹{record.salary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-gray-900">₹{record.net_salary.toLocaleString()}</div>
                    </td>
                    <td className="max-w-xs px-3 py-4 whitespace- flex-wrap text-center">
                      <div className="text-sm font-semibold text-gray-500">{record.info}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.payment_status === "paid" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {capitalizeFirst(record.payment_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex flex-col items-center space-y-2">
                        <a
                          href={`/nurses/salary-report?nurseId=${record.nurse_id}&payPeriodStart=${encodeURIComponent(record.pay_period_start)}&payPeriodEnd=${encodeURIComponent(record.pay_period_end)}`}
                          className="text-blue-600 hover:text-blue-900 text-xs hover:underline"
                        >
                          View Details
                        </a>
                        {/* <a
                          href={`/dearcare-payroll/edit-nurse-salary/${record.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-xs hover:underline"
                        >
                          Edit
                        </a> */}
                        <button
                            onClick={() => {}}
                            disabled={record.payment_status === "paid"}
                            className="text-green-600 hover:text-green-900 text-xs hover:underline mt-1 disabled:opacity-60"
                        >
                            Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 
                `No salary records found matching "${searchQuery}"` : 
                "No salary records found"}
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