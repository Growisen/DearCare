"use client"

import PaymentHeader from "@/components/client/payments/PaymentHeader"
import PaymentTable from "@/components/client/payments/PaymentTable"
import { PaginationControls } from "@/components/client/clients/PaginationControls";
import React, { useState, useEffect } from "react";
import { LoadingState } from "@/components/Loader"
import { fetchPaymentOverview } from "@/app/actions/clients/client-payment-records";

type Payment = {
	id: string;
	clientName: string;
	groupName: string;
	amount: number;
	date: string;
	modeOfPayment?: string;
};

export default function ClientPaymentsListPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [dateFilter, setDateFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400); 

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      const result = await fetchPaymentOverview({
        page: currentPage,
        pageSize,
        search: debouncedSearch,
        filters: { ...filters, date: dateFilter },
				isExporting: false,
      });
      if (result.success && result.data) {
        setPayments(result.data.recentPayments);
        setTotalCount(result.data.totalPayments);
      }
      setLoading(false);
    }
    loadPayments();
  }, [currentPage, pageSize, debouncedSearch, filters, dateFilter]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({});
    setDateFilter("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const handleExport = async () => {
		setIsExporting(true);
		try {
			const result = await fetchPaymentOverview({
				page: currentPage,
				pageSize,
				search: debouncedSearch,
				filters: { ...filters, date: dateFilter },
				isExporting: true,
			});
			if (result.success && result.data && result.data.recentPayments) {
				const payments = result.data.recentPayments;
				const headers = ["Client Name", "Group Name", "Amount", "Date", "Mode Of Payment"];
				const csvRows = [
					headers.join(","),
					...payments.map(p =>
						[
							`"${p.clientName}"`,
							`"${p.groupName}"`,
							p.amount,
							`"${p.date}"`,
							`"${p.modeOfPayment || ""}"`
						].join(",")
					)
				];
				const csvContent = csvRows.join("\n");
				const blob = new Blob([csvContent], { type: "text/csv" });
				const url = URL.createObjectURL(blob);

				const a = document.createElement("a");
				a.href = url;
				a.download = "client-payments.csv";
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
			}
		} finally {
			setIsExporting(false);
		}
	};


  console.log("Rendering ClientPaymentsListPage with payments:", payments);

  return (
    <div className="mx-auto pt-2 pb-4">
      <PaymentHeader
        searchInput={searchInput}
        setSearchInputAction={setSearchInput}
        handleSearchAction={handleSearch}
        handleResetFiltersAction={handleResetFilters}
        dateFilter={dateFilter}
        setDateFilterAction={setDateFilter}
        onExportAction={handleExport}
        isExporting={isExporting}
      />
      <div className="mt-6">
        {loading ? (
          <LoadingState message="Loading payments..." className="bg-white rounded-sm shadow-none overflow-hidden border border-slate-200"/>
        ) : (
          <>
            <PaymentTable payments={payments} />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              setPageSize={setPageSize}
              itemsLength={payments.length}
              onPageChange={handlePageChange}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
            />
          </>
        )}
      </div>
    </div>
  );
}