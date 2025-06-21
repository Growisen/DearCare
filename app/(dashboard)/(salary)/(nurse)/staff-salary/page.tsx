// filepath: c:\Container\Growisen\DearCare\app\(dashboard)\(salary)\(nurse)\staff-salary\page.tsx
"use client"
import { PaginationControls } from "@/components/client/clients/PaginationControls"
import { SalaryHeader } from "@/components/salary/SalaryHeader"
import { SalaryTable } from "@/components/salary/SalaryTable"
import { SalaryMobileCards } from "@/components/salary/SalaryMobileCards"
import { useSalaryCalculation } from "@/app/hooks/useSalaryCalculation"

const categories = ["all", "DearCare LLP", "Tata HomeNursing"]

export default function StaffSalaryPage() {
  const {
    salaryData,
    loading,
    error,
    selectedCategory,
    dateFrom,
    dateTo,
    currentPage,
    calculateHours,
    resetFilters,
    handleCategoryChange,
    handleDateFromChange,
    handleDateToChange,
    setCurrentPage,
  } = useSalaryCalculation();

  const pageSize = 50;
  const totalCount = salaryData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  const paginatedData = salaryData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
    
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <div className="space-y-5 sm:space-y-7">
        <SalaryHeader 
          title="Staff Salary" 
          subtitle="Calculate and review staff salary details"
          categories={categories}
          selectedCategory={selectedCategory}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onCategoryChange={handleCategoryChange}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onCalculate={calculateHours}
          onResetFilters={resetFilters}
        />
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-6 text-center">Loading hours data...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : salaryData.length > 0 ? (
            <>
              <SalaryTable data={paginatedData} />
              <SalaryMobileCards data={paginatedData} />
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemsLength={paginatedData.length}
                onPageChange={setCurrentPage}
                onPreviousPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No data available for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}