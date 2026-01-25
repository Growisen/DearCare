"use client";

import React from "react";
import { useNursesSalary } from "@/hooks/useNursesSalary";
import { useAdvancePaymentsData } from "@/hooks/useAdvancePaymentsData";
import { StatsSummary } from "@/components/nurseSalary/StatsSummary";
import { NursesSalaryHeader } from "@/components/nurseSalary/NurseSalaryHeader";
import { NursesSalaryTable } from "@/components/nurseSalary/NurseSalaryTable";

export default function NursesSalaryPage() {
  const {
    salaryRecords,
    stats,
    loading,
    aggregatesLoading,
    currentPage,
    pageSize,
    totalCount,
    searchInput,
    searchQuery,
    isExporting,
    setSearchInput,
    setPageSize,
    dateFilters,
    setDateFilters,
    handleResetFilters,
    handleSearchClick,
    handleExport,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
  } = useNursesSalary();

  const {
    advancePaymentsTotals: advanceTotalsQuery,
  } = useAdvancePaymentsData({
    selectedDate: undefined,
    advancePaymentsSearchTerm: searchQuery,
  });

  const advanceTotals = advanceTotalsQuery.data ?? { totalAmountGiven: 0, totalAmountReturned: 0 };

  return (
    <div>
      <NursesSalaryHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearchClick={handleSearchClick}
        handleResetFilters={handleResetFilters}
        handleExport={handleExport}
        isExporting={isExporting}
        loading={loading}
        salaryRecordsLength={salaryRecords.length}
        dateFilters={dateFilters}
        setDateFilters={setDateFilters}
      />

      <StatsSummary
        stats={stats}
        advanceTotals={advanceTotals}
        aggregatesLoading={aggregatesLoading}
        advanceTotalsLoading={advanceTotalsQuery.isLoading}
      />

      <NursesSalaryTable
        salaryRecords={salaryRecords}
        loading={loading}
        searchQuery={searchQuery}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        handlePageChange={handlePageChange}
        handlePreviousPage={handlePreviousPage}
        handleNextPage={handleNextPage}
        setPageSize={setPageSize}
      />
    </div>
  );
}