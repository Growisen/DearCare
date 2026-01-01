"use client"

import { Card } from "@/components/ui/card"
import { CreditCard, Download, Search } from "lucide-react"
import { useState, useEffect } from "react"
import Loader from "@/components/Loader"
import Link from "next/link"
import { formatDate, formatName } from "@/utils/formatters"

interface PaymentOverviewProps {
  paymentData?: {
    totalPayments: number;
    totalAmount: number;
    recentPayments: Array<{
      id: string;
      clientName: string;
      groupName: string;
      amount: number;
      date: string;
      modeOfPayment?: string;
      totalCommission?: number;
    }>;
  };
  loading?: boolean;
}

export default function PaymentOverview({ paymentData, loading = false }: PaymentOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [payments, setPayments] = useState(paymentData?.recentPayments || [])

  useEffect(() => {
    if (paymentData?.recentPayments) {
      setPayments(paymentData.recentPayments)
    }
  }, [paymentData])

  const filteredPayments = payments.filter(p =>
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExport = () => {
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
  }

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-slate-200 rounded-sm
       mt-6 flex items-center justify-center min-h-[300px]"
      >
        <Loader message="Loading payments..." size="large" color="primary" centered />
      </Card>
    )
  }

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
               rounded-sm focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 
            sm:text-sm font-medium bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors shadow-none"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      <div className="mb-4 flex gap-6">
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Total Payments:</span> {paymentData?.totalPayments ?? 0}
        </div>
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Total Amount:</span> ₹{paymentData?.totalAmount?.toLocaleString() ?? "0"}
        </div>
        <div className="text-sm text-slate-700">
          <span className="font-semibold">Total Commission:</span> ₹{paymentData?.recentPayments?.reduce((acc, p) => acc + (p.totalCommission ?? 0), 0).toLocaleString() ?? "0"}
        </div>
      </div>
      <div className="overflow-x-auto">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-slate-50 border border-slate-200 text-slate-600 px-6 py-5 rounded-sm">
              <p className="text-lg font-medium mb-1">No payments found</p>
              <p className="text-sm">No payments available for the selected date</p>
            </div>
          </div>
        ) : (
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
              {filteredPayments.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-800">{formatName(p.clientName)}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{p.groupName}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">₹{p.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{formatDate(p.date)}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{p.modeOfPayment || "-"}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {p.totalCommission ? `₹${p.totalCommission.toLocaleString()}` : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
       <div className="text-center mt-4">
        <Link 
          href="/client-payments" 
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          View All Payments from clients →
        </Link>
      </div>
    </Card>
  )
}