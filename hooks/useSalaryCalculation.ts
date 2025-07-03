import { useState } from 'react';
import { StaffSalary } from '@/types/staffSalary.types';
import { fetchNurseHoursWorked } from '@/app/actions/payroll/salary-actions';

export function useSalaryCalculation() {
  const [salaryData, setSalaryData] = useState<StaffSalary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  
  const calculateHours = async () => {
    if (!dateFrom || !dateTo) {
      setError("Please select both from and to dates");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchNurseHoursWorked(dateFrom, dateTo, selectedCategory);
      
      if (response.success) {
        setSalaryData(response.data);
      } else {
        setError(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setDateFrom("");
    setDateTo("");
    setSalaryData([]); // Clear existing data when filters are reset
  };
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  // Handle date changes
  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
  };
  
  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
  };
  
  return {
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
  };
}