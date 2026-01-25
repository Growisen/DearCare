"use client"

import { Card } from "@/components/ui/card"
import { CreditCard, Download, Search, ArrowUpRight, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { RefundPaymentsFilters } from "@/hooks/useRefunds"
import { formatDate, formatName } from "@/utils/formatters"
import { Refund } from "@/hooks/useRefunds"
import { PaginationControls } from "@/components/client/clients/PaginationControls"

interface RefundOverviewProps {
  refunds: Refund[]
  loading: boolean
  error?: unknown
  filters: RefundPaymentsFilters
  setFilters: React.Dispatch<React.SetStateAction<RefundPaymentsFilters>>
  searchTerm: string
  setSearchTerm: (v: string) => void
  page: number
  pageSize: number
  totalPages: number
  totalCount: number
  onPageChangeAction: (page: number) => void,
  onPreviousPageAction: () => void,
  onNextPageAction: () => void,
  setPageSizeAction: (size: number) => void,
}

export default function RefundOverview({
  refunds,
  loading,
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  page,
  pageSize,
  totalPages,
  totalCount,
  onNextPageAction,
  onPreviousPageAction,
  onPageChangeAction,
  setPageSizeAction,
}: RefundOverviewProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    if (loading) return
    setIsExporting(true)
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Client Name,Amount,Refund Date,Created At,Payment Method,Payment Type,Reason"]
        .concat(refunds.map(r =>
          `${r.clientName || ""},${r.amount},${r.refundDate},${r.createdAt},${r.paymentMethod},${r.paymentType},${r.reason || ""}`
        )).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "refunds.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsExporting(false)
  }

  return (
    <Card className="px-3 pt-3 bg-white border border-slate-200 rounded-sm">
      <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center 
        sm:items-center justify-between mb-3 sm:mb-4 border-b border-slate-200 pb-2"
      >
        <div className="flex items-center mb-2 xs:mb-0 sm:mb-0">
          <CreditCard className="w-5 h-5 text-slate-700 mr-2" />
          <h3 className="text-sm sm:text-md font-medium text-slate-800">Refunds Overview</h3>
        </div>
        <div className="flex flex-col w-full sm:flex-row sm:w-auto items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search refunds..."
              className="pl-8 pr-3 py-1.5 sm:py-2 text-xs text-gray-800 sm:text-sm border border-slate-300
               rounded-sm focus:outline-none disabled:bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 
            sm:text-sm font-medium bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors shadow-none disabled:bg-blue-400"
            onClick={handleExport}
            disabled={isExporting || loading}
          >
            {isExporting ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-1 h-3 w-3 text-white" />
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

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 justify-between">
        <div className="flex gap-6">
          <div className="text-sm text-slate-700 flex items-center gap-2">
            <span className="font-semibold">Total Refunds:</span>
            {loading ? <span className="inline-block h-4 w-10 bg-slate-200 rounded animate-pulse" /> : (refunds?.length ?? 0)}
          </div>
          <div className="text-sm text-slate-700 flex items-center gap-2">
            <span className="font-semibold">Total Amount:</span>
            {loading
              ? <span className="inline-block h-4 w-16 bg-slate-200 rounded animate-pulse" />
              : `₹${refunds?.reduce((acc, r) => acc + (r.amount || 0), 0).toLocaleString()}`}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Payment Type:</span>
          <div className="flex gap-1.5 items-center flex-wrap">
            {["all", "cash", "bank transfer"].map((type) => (
              <button
                key={type}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border ${
                  (filters.paymentType === type || (!filters.paymentType && type === "all"))
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white text-gray-600 hover:bg-gray-100 border-slate-200"
                }`}
                onClick={() => setFilters((prev) => ({
                  ...prev,
                  paymentType: type === "all" ? undefined : type
                }))}
                type="button"
                disabled={loading}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="hidden sm:table w-full">
          <thead>
            <tr className="text-left border-b border-slate-200">
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Client Name</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Refund Date</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Created At</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Payment Method</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Payment Type</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  {Array.from({ length: 7 }).map((_, colIdx) => (
                    <td key={colIdx} className="py-3 px-4">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : refunds.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <div className="bg-slate-50 border border-slate-200 text-slate-600 px-6 py-5 rounded-sm inline-block">
                    <p className="text-lg font-medium mb-1">No refunds found</p>
                    <p className="text-sm">No refunds available for the selected criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              refunds.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-800">
                    {r.clientId ? (
                      <Link
                        href={`/client-profile/${r.clientId}`}
                        className="text-gray-700 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        prefetch={false}
                      >
                        {formatName(r.clientName || "")}
                        <ArrowUpRight className="inline w-3.5 h-3.5 ml-1 text-blue-700" />
                      </Link>
                    ) : (
                      formatName(r.clientName || "")
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">₹{r.amount?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{formatDate(r.refundDate)}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{formatDate(r.createdAt)}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{r.paymentMethod}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{r.paymentType}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{r.reason || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        setPageSize={setPageSizeAction}
        itemsLength={refunds.length}
        onPageChange={onPageChangeAction}
        onPreviousPage={onPreviousPageAction}
        onNextPage={onNextPageAction}
        loading={loading}
      />
    </Card>
  )
}