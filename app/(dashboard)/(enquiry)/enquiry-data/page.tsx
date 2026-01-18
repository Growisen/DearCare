'use client'

import React, { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  X, 
  RefreshCw, 
  AlertCircle, 
  SearchX, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";
import { fetchAllServiceEnquiries, ServiceEnquiryData, PaginationInfo } from "@/app/actions/enquiry/enquiry-actions";
import { PaginationControls } from "@/components/client/clients/PaginationControls";

const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-gray-100">
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-sm w-3/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-sm w-1/2"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-sm w-1/2"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded-sm w-1/3"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-sm w-24"></div></td>
      </tr>
    ))}
  </>
);

export default function EnquiryDataPage() {
  const [enquiries, setEnquiries] = useState<ServiceEnquiryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");

  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAllServiceEnquiries(
        pagination.currentPage, 
        pagination.pageSize, 
        searchTerm
      );

      if (result.success && result.data) {
        setEnquiries(result.data);
        if (result.pagination) {
          setPagination(prev => ({ ...prev, ...result.pagination }));
        }
      } else {
        setError(result.error || "Failed to fetch enquiries");
        setEnquiries([]);
      }
    } catch {
      setError("An unexpected connection error occurred");
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchTrigger = () => {
    if (searchInput.trim() === searchTerm) return;
    setSearchTerm(searchInput.trim());
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages || loading) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchTrigger();
    }
  };

  const handlePreviousPage = () => handlePageChange(pagination.currentPage - 1);
  const handleNextPage = () => handlePageChange(pagination.currentPage + 1);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Service Enquiries</h1>
              <div className="mt-1 flex items-center text-sm text-gray-500 gap-2">
                <span>
                  Total: <span className="font-medium text-gray-900">{pagination.totalCount}</span> records
                </span>
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Filter: {searchTerm}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search name, email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="block w-full sm:w-64 pl-10 pr-10 py-2 sm:text-sm rounded-sm focus:outline-none border border-slate-300
                  text-slate-800 transition-shadow"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSearchTrigger}
                  disabled={loading || searchInput.trim() === searchTerm}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Search
                </button>
                
                {searchTerm && (
                   <button
                   onClick={handleClearSearch}
                   className="px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-sm hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
                 >
                   Clear
                 </button>
                )}

                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 bg-white text-gray-500 border border-gray-300 rounded-sm hover:bg-gray-50 hover:text-gray-700 focus:ring-4 focus:ring-gray-100 transition-all"
                  title="Refresh Data"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-sm p-4 flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="hidden lg:block bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Phone', 'Location', 'Service'].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && enquiries.length === 0 ? (
                  <TableSkeleton />
                ) : enquiries.length > 0 ? (
                  enquiries.map((enquiry, idx) => (
                    <tr key={idx} className={`hover:bg-gray-50 transition-colors ${loading ? 'opacity-50' : 'opacity-100'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{enquiry.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enquiry.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enquiry.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enquiry.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">
                          {enquiry.service}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <SearchX className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-base font-medium text-gray-900">No enquiries found</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? `No matches for "${searchTerm}"` : "Get started by sharing your service form."}
                        </p>
                        {searchTerm && (
                          <button onClick={handleClearSearch} className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Clear search filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {pagination.totalPages > 0 && (
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              pageSize={pagination.pageSize}
              itemsLength={enquiries.length}
              onPageChange={handlePageChange}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              loading={loading}
              disabled={loading}
            />
          )}
        </div>

        <div className="lg:hidden grid grid-cols-1 gap-4">
          {loading && enquiries.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm animate-pulse">
                <div className="h-5 bg-gray-200 rounded-sm w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded-sm w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-sm w-2/3"></div>
                </div>
              </div>
            ))
          ) : enquiries.length > 0 ? (
            enquiries.map((enquiry, idx) => (
              <div key={idx} className={`bg-white rounded-sm border border-gray-200 shadow-sm p-5 space-y-4 ${loading ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{enquiry.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {enquiry.location}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">
                    {enquiry.service}
                  </span>
                </div>
                
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <a href={`mailto:${enquiry.email}`} className="hover:text-blue-600 truncate">{enquiry.email}</a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <a href={`tel:${enquiry.phone}`} className="hover:text-blue-600">{enquiry.phone}</a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No data available.</p>
            </div>
          )}

          {pagination.totalPages > 0 && (
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              pageSize={pagination.pageSize}
              itemsLength={enquiries.length}
              onPageChange={handlePageChange}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              loading={loading}
              // setPageSize={...} // Optionally pass if you want to allow changing page size
            />
          )}
        </div>
      </div>
    </div>
  );
}