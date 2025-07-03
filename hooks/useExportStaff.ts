import { useState, useCallback } from "react";
import { exportStaff } from "@/app/actions/staff-management/staff-actions";
import { StaffRole } from "@/types/dearCareStaff.types";

export function useExportStaff(selectedRole: StaffRole | "all", searchQuery: string) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      
      const response = await exportStaff(selectedRole, searchQuery);
      
      if (!response.success) {
        console.error("Failed to export staff data:", response.error);
        throw new Error(response.error || "Export failed");
      }
      
      const data = response.data;
      
      if (!data || data.length === 0) {
        alert("No data available to export");
        return;
      }
      
      // Define CSV headers
      const headers = [
        'Name', 'Email', 'Phone', 'Role', 'Join Date', 
        'Status', 'Address', 'City', 'District', 'State', 'Pincode', 
        'Created At', 'Updated At'
      ];
      
      // Format rows for CSV
      const rows = data.map((item) => [
        item.name?.replace(/,/g, ' ') || '',
        item.email?.replace(/,/g, ' ') || '',
        item.phone?.replace(/,/g, ' ') || '',
        item.role?.replace(/,/g, ' ') || '',
        item.join_date || '',
        item.status?.replace(/,/g, ' ') || '',
        `${item.address_line1?.replace(/,/g, ' ')}${item.address_line2 ? ` ${item.address_line2?.replace(/,/g, ' ')}` : ''}`,
        item.city?.replace(/,/g, ' ') || '',
        item.district?.replace(/,/g, ' ') || '',
        item.state?.replace(/,/g, ' ') || '',
        item.pincode || '',
        new Date(item.created_at).toLocaleString().replace(/,/g, ' '),
        new Date(item.updated_at).toLocaleString().replace(/,/g, ' ')
      ]);
      
      // Build CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      const roleStr = selectedRole !== "all" ? `-${selectedRole}` : "";
      const searchStr = searchQuery ? `-filtered` : "";
      const filename = `staff-data${roleStr}${searchStr}-${dateStr}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error exporting staff data:", error);
      alert("Failed to export staff data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [selectedRole, searchQuery]);

  return { isExporting, handleExport };
}