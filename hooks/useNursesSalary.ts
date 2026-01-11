import { useState, useEffect, useRef } from "react";
import { 
  fetchSalaryPaymentDebts, 
  SalaryPaymentDebtRecord, 
  fetchSalaryDataAggregates 
} from "@/app/actions/payroll/calculate-nurse-salary";

interface SalaryStats {
  total_approved_amount: number;
  total_salary_amount: number;
}

export function useNursesSalary() {
  const [salaryRecords, setSalaryRecords] = useState<SalaryPaymentDebtRecord[]>([]);
  const [stats, setStats] = useState<SalaryStats>({ total_approved_amount: 0, total_salary_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [aggregatesLoading, setAggregatesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 500);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchInput]);

  useEffect(() => {
    const fetchSalaryRecords = async () => {
      setLoading(true);
      try {
        const tableData = await fetchSalaryPaymentDebts({
          page: currentPage,
          pageSize,
          search: searchQuery
        });
        if (tableData.success) {
          setSalaryRecords(Array.isArray(tableData.records) ? tableData.records : []);
          setTotalCount(tableData.total);
        } else {
          setSalaryRecords([]);
        }
      } catch {
        setSalaryRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSalaryRecords();
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    const fetchAggregates = async () => {
      setAggregatesLoading(true);
      try {
        const statsData = await fetchSalaryDataAggregates({
          search: searchQuery,
          date: null
        });
        if (statsData.success && statsData.aggregates) {
          setStats({
            total_approved_amount: Number(statsData.aggregates.total_approved_amount || 0),
            total_salary_amount: Number(statsData.aggregates.total_salary_amount || 0)
          });
        }
      } catch {} 
      finally {
        setAggregatesLoading(false);
      }
    };
    fetchAggregates();
  }, [searchQuery]);

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearchClick = () => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportResult = await fetchSalaryPaymentDebts({
        page: 1,
        pageSize: totalCount,
        search: searchQuery,
        exportMode: true,
      });
      if (exportResult.success && exportResult.records) {
        const blob = new Blob([Array.isArray(exportResult.records) ? 
          exportResult.records.join('') : String(exportResult.records)], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "nurse_salary_payments.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Export failed: " + (exportResult.error || "Unknown error"));
      }
    } catch (error) {
      alert("Export failed: " + error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalCount / pageSize)));

  return {
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
    handleResetFilters,
    handleSearchClick,
    handleExport,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
  };
}