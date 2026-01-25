"use client"

import { Card } from "@/components/ui/card"
import { CreditCard, Download, Search, ArrowUpRight } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDate, formatName } from "@/utils/formatters"

interface PaymentOverviewProps {
  paymentData?: {
    totalPayments: number;
    totalAmount: number;
    recentPayments: Array<{
      id: string;
      clientName: string;
      clientId?: string;
      groupName: string;
      amount: number;
      date: string;
      modeOfPayment?: string;
      totalCommission?: number;
      paymentType?: string;
    }>;
  };
  loading?: boolean;
  paymentFilters?: { date?: Date | null; paymentType?: string };
  setPaymentFilters?: React.Dispatch<React.SetStateAction<{ date?: Date | null; paymentType?: string }>>;
}

export default function PaymentOverview({
  paymentData,
  loading = false,
  paymentFilters,
  setPaymentFilters
}: PaymentOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [payments, setPayments] = useState(paymentData?.recentPayments || [])
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (paymentData?.recentPayments) {
      setPayments(paymentData.recentPayments)
    }
  }, [paymentData])

  const filteredPayments = payments.filter(p =>
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExport = () => {
    if (loading) return;
    setIsExporting(true)
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Client Name,Group,Amount,Date,Mode of Payment"]
        .concat(filteredPayments.map(p =>
          `${p.clientName},${p.groupName},${p.amount},${p.date},${p.modeOfPayment || ""}`
        )).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "recent_payments.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsExporting(false)
  }

  const totalCommission = paymentData?.recentPayments?.reduce((acc, p) => acc + (p.totalCommission ?? 0), 0) ?? 0;

  return (
    <Card className="p-3 sm:p-4 bg-white border border-slate-200 rounded-sm">
      <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center 
        sm:items-center justify-between mb-3 sm:mb-4 border-b border-slate-200 pb-2"
      >
        <div className="flex items-center mb-2 xs:mb-0 sm:mb-0">
          <CreditCard className="w-5 h-5 text-slate-700 mr-2" />
          <h3 className="text-sm sm:text-md font-medium text-slate-800">Clients Payments Overview</h3>
        </div>
        <div className="flex flex-col w-full sm:flex-row sm:w-auto items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search payments..."
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
                <svg className="animate-spin mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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
            <span className="font-semibold">Total Payments:</span> 
            {loading ? <span className="inline-block h-4 w-10 bg-slate-200 rounded animate-pulse" /> : (paymentData?.totalPayments ?? 0)}
          </div>
          <div className="text-sm text-slate-700 flex items-center gap-2">
            <span className="font-semibold">Total Amount:</span> 
            {loading ? <span className="inline-block h-4 w-16 bg-slate-200 rounded animate-pulse" /> : `₹${paymentData?.totalAmount?.toLocaleString() ?? "0"}`}
          </div>
          <div className="text-sm text-slate-700 flex items-center gap-2">
            <span className="font-semibold">Total Commission:</span> 
            {loading ? <span className="inline-block h-4 w-16 bg-slate-200 rounded animate-pulse" /> : `₹${totalCommission.toLocaleString()}`}
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Payment Type:</span>
          <div className="flex gap-1.5 items-center flex-wrap">
            {["all", "cash", "bank transfer"].map((type) => (
              <button
                key={type}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border ${
                  (paymentFilters?.paymentType === type || (!paymentFilters?.paymentType && type === "all"))
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white text-gray-600 hover:bg-gray-100 border-slate-200"
                }`}
                onClick={() => setPaymentFilters && setPaymentFilters((prev) => ({
                  ...prev,
                  paymentType: type
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
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Group</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Mode</th>
              <th className="py-3 px-4 text-sm font-semibold text-slate-600">Total Commission</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  {Array.from({ length: 6 }).map((_, colIdx) => (
                    <td key={colIdx} className="py-3 px-4">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <div className="bg-slate-50 border border-slate-200 text-slate-600 px-6 py-5 rounded-sm inline-block">
                    <p className="text-lg font-medium mb-1">No payments found</p>
                    <p className="text-sm">No payments available for the selected criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-800">
                    {p.clientId ? (
                      <Link
                        href={`/client-profile/${p.clientId}`}
                        className="text-gray-700 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        prefetch={false}
                      >
                        {formatName(p.clientName)}
                        <ArrowUpRight className="inline w-3.5 h-3.5 ml-1 text-blue-700" />
                      </Link>
                    ) : (
                      formatName(p.clientName)
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{p.groupName}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">₹{p.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{formatDate(p.date)}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {p.modeOfPayment || "-"}
                    {p.paymentType && (
                      <>
                        <br />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {p.paymentType}
                        </span>
                      </>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {p.totalCommission ? `₹${p.totalCommission.toLocaleString()}` : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
      </div>

      <div className="text-center mt-4">
        <Link
          href="/client-payments"
          prefetch={false}
          className={`text-xs font-medium text-blue-600 hover:text-blue-800 ${loading ? 'pointer-events-none opacity-50' : ''}`}
        >
          View All Payments from clients →
        </Link>
      </div>
    </Card>
  )
}