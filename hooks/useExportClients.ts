import { useState } from "react";
import { exportClients } from "@/app/actions/clients/client-actions";
import { ClientFilters } from "@/types/client.types";

export function useExportClients(selectedStatus: ClientFilters, searchQuery: string) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const result = await exportClients(selectedStatus, searchQuery);
      
      if (!result.success || !result.clientsData || result.clientsData.length === 0) {
        alert('No clients found to export');
        setIsExporting(false);
        return;
      }
      
      const individualClients = result.clientsData.filter(client => client.client_type === 'individual');
      const organizationClients = result.clientsData.filter(client => client.client_type !== 'individual');
      
      const individualHeaders = [
        'Client Type', 'Status', 'Created Date', 'Notes',
        'Requestor Name', 'Requestor Phone', 'Requestor Email',
        'Patient Name', 'Patient Age', 'Patient Gender',
        'Requestor Address', 'Requestor District', 'Requestor City', 
        'Requestor Pincode', 'Service Required', 'Start Date',
        'Care Duration', 'Relation to Patient'
      ];
      
      const organizationHeaders = [
        'Client Type', 'Status', 'Created Date', 'Notes',
        'Organization Name', 'Organization Type',
        'Contact Person', 'Contact Role',
        'Contact Phone', 'Contact Email',
        'Organization Address', 'Organization State',
        'Organization District', 'Organization City',
        'Organization Pincode', 'Start Date'
      ];
      
      const individualRows = individualClients.map(client => [
        client.client_type?.replace(/,/g, ' ') || '',
        client.status?.replace(/,/g, ' ') || '',
        new Date(client.created_at || new Date()).toISOString().split('T')[0],
        client.general_notes?.replace(/,/g, ' ') || '',
        client.requestor_name?.replace(/,/g, ' ') || '',
        client.requestor_phone?.replace(/,/g, ' ') || '',
        client.requestor_email?.replace(/,/g, ' ') || '',
        client.patient_name?.replace(/,/g, ' ') || '',
        client.patient_age?.toString() || '',
        client.patient_gender?.replace(/,/g, ' ') || '',
        client.requestor_address?.replace(/,/g, ' ') || '',
        client.requestor_district?.replace(/,/g, ' ') || '',
        client.requestor_city?.replace(/,/g, ' ') || '',
        client.requestor_pincode?.replace(/,/g, ' ') || '',
        client.service_required?.replace(/,/g, ' ') || '',
        client.start_date ? new Date(client.start_date).toISOString().split('T')[0] : '',
        client.care_duration?.replace(/,/g, ' ') || '',
        client.relation_to_patient?.replace(/,/g, ' ') || ''
      ]);
      
      const organizationRows = organizationClients.map(client => [
        client.client_type?.replace(/,/g, ' ') || '',
        client.status?.replace(/,/g, ' ') || '',
        new Date(client.created_at || new Date()).toISOString().split('T')[0],
        client.general_notes?.replace(/,/g, ' ') || '',
        client.organization_name?.replace(/,/g, ' ') || '',
        client.organization_type?.replace(/,/g, ' ') || '',
        client.contact_person_name?.replace(/,/g, ' ') || '',
        client.contact_person_role?.replace(/,/g, ' ') || '',
        client.contact_phone?.replace(/,/g, ' ') || '',
        client.contact_email?.replace(/,/g, ' ') || '',
        client.organization_address?.replace(/,/g, ' ') || '',
        client.organization_state?.replace(/,/g, ' ') || '',
        client.organization_district?.replace(/,/g, ' ') || '',
        client.organization_city?.replace(/,/g, ' ') || '',
        client.organization_pincode?.replace(/,/g, ' ') || '',
        client.start_date ? new Date(client.start_date).toISOString().split('T')[0] : ''
      ]);
      
      let csvRows = [];
      
      if (individualClients.length > 0 && organizationClients.length > 0) {
        csvRows = [
          ['INDIVIDUAL CLIENTS'],
          individualHeaders,
          ...individualRows,
          [], 
          ['ORGANIZATION CLIENTS'],
          organizationHeaders,
          ...organizationRows
        ];
      } else if (individualClients.length > 0) {
        csvRows = [
          individualHeaders,
          ...individualRows
        ];
      } else {
        csvRows = [
          organizationHeaders,
          ...organizationRows
        ];
      }
        
      const csvContent = csvRows.map(row => {
        if (Array.isArray(row)) {
          return row.join(',');
        }
        return row || '';
      }).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `clients_export_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting clients:', error);
      alert('Failed to export clients');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExport
  }
}