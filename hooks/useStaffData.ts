import { useState, useEffect, useCallback } from "react";
import { getStaff } from "@/app/actions/staff-management/staff-actions";
import { Staff, StaffOrganization } from "@/types/dearCareStaff.types";
import useOrgStore from '@/app/stores/UseOrgStore';

export function useStaffData() {
  const { organization } = useOrgStore();
  const [staff, setStaff] = useState<Staff[]>([]);  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Map organization from store to staff organization
  const getStaffOrganization = (): StaffOrganization | "all" => {
    if (!organization) return "all";
    if (organization === "TataHomeNursing") return "Tata HomeNursing";
    if (organization === "DearCare") return "DearCare LLP";
    return "all";
  };

  const selectedCategory = getStaffOrganization();
  
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getStaff(
        selectedCategory, 
        searchQuery, 
        currentPage, 
        pageSize
      );
      
      if (!response.success) {
        setError(response.error || "Failed to fetch staff data");
        setStaff([]);
        return;
      }
      
      const resolvedStaff = await Promise.all((response.staff || []).map(async (staffMember) => {
        let profileImage: string | undefined = undefined;
        
        if (staffMember.profileImage instanceof Promise) {
          const resolvedImage = await staffMember.profileImage;
          profileImage = resolvedImage || undefined;
        }
        
        return {
          ...staffMember,
          profileImage
        };
      }));
      
      setStaff(resolvedStaff);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalCount(response.pagination?.totalCount || 0);
      
    } catch (err) {
      console.error("Error fetching staff data:", err);
      setError("An unexpected error occurred. Please try again.");
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, currentPage, pageSize]);
  
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  }, [searchInput]);
  
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }
  
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);
  
  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData, selectedCategory, searchQuery, currentPage, pageSize]);
  
  return {
    staff,
    isLoading,
    error,
    searchInput,
    setSearchInput,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    handleSearch,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    refreshData
  };
}