import React, { useState, useRef, useEffect } from 'react';
import { DetailedClientIndividual, DetailedClientOrganization } from '@/types/client.types';
import { updateIndividualClientProfile, updateOrganizationDetails } from '@/app/actions/client-actions';
import toast from 'react-hot-toast';
import { dutyPeriodOptions, serviceOptions } from '@/utils/constants';
import { relationOptions } from "@/utils/constants"

interface ClientEditFormProps {
  client: DetailedClientIndividual | DetailedClientOrganization;
  onSave: (updatedClient: DetailedClientIndividual | DetailedClientOrganization) => void;
  onCancel: () => void;
}

export default function ClientEditForm({ client, onSave, onCancel }: ClientEditFormProps) {
  const [formData, setFormData] = useState<DetailedClientIndividual | DetailedClientOrganization>(client);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add refs to track input focus
  const activeElementRef = useRef<string | null>(null);
  const activeElementSelectionStart = useRef<number | null>(null);
  const activeElementSelectionEnd = useRef<number | null>(null);

  const isIndividual = client.client_type === 'individual';

  // Save the active element reference before state update
  const saveActiveElementState = () => {
    if (document.activeElement instanceof HTMLInputElement || 
        document.activeElement instanceof HTMLTextAreaElement) {
      activeElementRef.current = document.activeElement.id;
      activeElementSelectionStart.current = document.activeElement.selectionStart;
      activeElementSelectionEnd.current = document.activeElement.selectionEnd;
    }
  };

  // Restore focus to the previously active element after state update
  useEffect(() => {
    if (activeElementRef.current) {
      const element = document.getElementById(activeElementRef.current);
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.focus();
        // Restore cursor position if available
        if (activeElementSelectionStart.current !== null && activeElementSelectionEnd.current !== null) {
          element.selectionStart = activeElementSelectionStart.current;
          element.selectionEnd = activeElementSelectionEnd.current;
        }
      }
    }
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    saveActiveElementState();
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prevData => {
        const parentObj = { ...(prevData[parent as keyof typeof prevData] as Record<string, string | number | boolean | null | undefined> || {}) };
        parentObj[child] = value;
        return {
          ...prevData,
          [parent]: parentObj
        };
      });
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (isIndividual) {
        // For individual clients
        const individualFormData = formData as DetailedClientIndividual;
        const details = individualFormData.details || {};

        if (client.details?.client_id){
          result = await updateIndividualClientProfile(client.details?.client_id, {
            patientFirstName: details.patient_name?.split(' ')[0] || '',
            patientLastName: details.patient_name?.split(' ').slice(1).join(' ') || '',
            patientPhone: details.patient_phone || '',
            patientAge: details.patient_age?.toString() || '',
            patientGender: details.patient_gender || null,
            patientAddress: details.patient_address || '',
            patientCity: details.patient_city || '',
            patientDistrict: details.patient_district || '',
            patientState: details.patient_state || '',
            patientPincode: details.patient_pincode || '',
            patientProfilePic: null, // File uploads would need to be handled separately
        
            preferredCaregiverGender: details.preferred_caregiver_gender || null,
            careDuration: details.care_duration || null,
            serviceRequired: details.service_required || null,
            startDate: details.start_date || null,
        
            requestorName: details.requestor_name || '',
            requestorPhone: details.requestor_phone || '',
            requestorEmail: details.requestor_email || '',
            requestorAddress: details.requestor_address || '',
            requestorCity: details.requestor_city || '',
            requestorDistrict: details.requestor_district || '',
            requestorState: details.requestor_state || '',
            requestorPincode: details.requestor_pincode || '',
            requestorProfilePic: null, // File uploads would need to be handled separately
        
            relationToPatient: details.relation_to_patient || null,
            requestorEmergencyPhone: details.requestor_emergency_phone || null,
            requestorJobDetails: details.requestor_job_details || null,
          });
        }
      } else {
        // For organization clients
        const orgFormData = formData as DetailedClientOrganization;
        const details = orgFormData.details || {};
        
        if(client.details?.client_id) {
            result = await updateOrganizationDetails(client.details?.client_id, {
                details: {
                  organization_name: details.organization_name || '',
                  contact_person_name: details.contact_person_name || '',
                  contact_person_role: details.contact_person_role || '',
                  contact_email: details.contact_email || '',
                  contact_phone: details.contact_phone || '',
                  organization_address: details.organization_address || '',
                  organization_state: details.organization_state || '',
                  organization_district: details.organization_district || '',
                  organization_city: details.organization_city || '',
                  organization_pincode: details.organization_pincode || ''
                },
                general_notes: orgFormData.general_notes
            });
        }
      }
      
      if (result?.success && result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
        toast.success(`${isIndividual ? 'Individual' : 'Organization'} client updated successfully`);
        onSave({ ...result.data, id: client.details?.client_id } as DetailedClientIndividual | DetailedClientOrganization);
      } else {
        toast.error(`Failed to update client: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormField = ({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    options = [],
    placeholder = '',
    required = false
  }: { 
    label: string; 
    name: string; 
    type?: string; 
    value: string | number | null | undefined; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    options?: Array<{value: string; label: string}>;
    placeholder?: string;
    required?: boolean;
  }) => {
    // Generate a unique ID for each input field based on the name
    const inputId = name.replace('.', '_');
    
    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {type === 'select' ? (
          <select
            id={inputId}
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required={required}
          >
            <option value="" className="text-gray-500">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={inputId}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
            required={required}
          />
        ) : (
          <input
            type={type}
            id={inputId}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
            required={required}
          />
        )}
      </div>
    );
  };

  const renderIndividualForm = () => {
    const individualClient = formData as DetailedClientIndividual;
    const details = individualClient.details || {};
    
    return (
      <>
        {/* Patient Information */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">Patient Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div className="space-y-4">
              <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Patient Name" name="details.patient_name" value={details.patient_name} onChange={handleInputChange} />
                <FormField label="Patient Age" name="details.patient_age" type="number" value={details.patient_age} onChange={handleInputChange} />
                <FormField 
                  label="Patient Gender" 
                  name="details.patient_gender" 
                  type="select" 
                  value={details.patient_gender} 
                  onChange={handleInputChange}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <FormField label="Patient Phone" name="details.patient_phone" value={details.patient_phone} onChange={handleInputChange} />
                <FormField 
                  label="Preferred Caregiver Gender" 
                  name="details.preferred_caregiver_gender" 
                  type="select" 
                  value={details.preferred_caregiver_gender} 
                  onChange={handleInputChange}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'any', label: 'Any' }
                  ]}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Address</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField 
                  label="Address" 
                  name="details.patient_address" 
                  type="textarea" 
                  value={details.patient_address || details.complete_address} 
                  onChange={handleInputChange}
                />
                <FormField label="City" name="details.patient_city" value={details.patient_city} onChange={handleInputChange} />
                <FormField label="District" name="details.patient_district" value={details.patient_district} onChange={handleInputChange} />
                <FormField label="Pincode" name="details.patient_pincode" value={details.patient_pincode} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Requestor Information */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">Requestor Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div className="space-y-4">
              <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Requestor Name" name="details.requestor_name" value={details.requestor_name} onChange={handleInputChange} />
                {/* Change Relation to Patient to a select field */}
                <FormField
                  label="Relation to Patient"
                  name="details.relation_to_patient"
                  type="select"
                  value={details.relation_to_patient}
                  onChange={handleInputChange}
                  options={relationOptions}
                />
                <FormField label="Requestor Email" name="details.requestor_email" type="email" value={details.requestor_email} onChange={handleInputChange} />
                <FormField label="Requestor Phone" name="details.requestor_phone" value={details.requestor_phone} onChange={handleInputChange} />
                <FormField label="Emergency Phone" name="details.requestor_emergency_phone" value={details.requestor_emergency_phone} onChange={handleInputChange} />
                <FormField label="Job Details" name="details.requestor_job_details" value={details.requestor_job_details} onChange={handleInputChange} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Requestor Address</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Address" name="details.requestor_address" type="textarea" value={details.requestor_address} onChange={handleInputChange} />
                <FormField label="City" name="details.requestor_city" value={details.requestor_city} onChange={handleInputChange} />
                <FormField label="District" name="details.requestor_district" value={details.requestor_district} onChange={handleInputChange} />
                <FormField label="Pincode" name="details.requestor_pincode" value={details.requestor_pincode} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Care Details */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">Care Requirements</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField 
              label="Service Required" 
              name="details.service_required" 
              type="select" 
              value={details.service_required} 
              onChange={handleInputChange} 
              options={serviceOptions}
            />
            <FormField 
              label="Duty Period" 
              name="duty_period" 
              type="select" 
              value={individualClient.duty_period} 
              onChange={handleInputChange} 
              options={dutyPeriodOptions}
            />
            <FormField label="Start Date" name="details.start_date" type="date" value={details.start_date} onChange={handleInputChange} />
            <FormField 
              label="Period Reason" 
              name="duty_period_reason" 
              type="textarea" 
              value={individualClient.duty_period_reason} 
              onChange={handleInputChange}
            />
          </div>
        </div>
      </>
    );
  };

  const renderOrganizationForm = () => {
    const orgClient = formData as DetailedClientOrganization;
    const details = orgClient.details || {};
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">Organization Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-6">
          <div className="space-y-4">
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Organization Name" name="details.organization_name" value={details.organization_name} onChange={handleInputChange} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact Person Name" name="details.contact_person_name" value={details.contact_person_name} onChange={handleInputChange} />
              <FormField label="Contact Person Role" name="details.contact_person_role" value={details.contact_person_role} onChange={handleInputChange} />
              <FormField label="Contact Email" name="details.contact_email" type="email" value={details.contact_email} onChange={handleInputChange} />
              <FormField label="Contact Phone" name="details.contact_phone" value={details.contact_phone} onChange={handleInputChange} />
            </div>
          </div>
        </div>
        
        {/* Organization Address Section */}
        <div>
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Organization Address</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Address" name="details.organization_address" type="textarea" value={details.organization_address} onChange={handleInputChange} />
            <FormField label="City" name="details.organization_city" value={details.organization_city} onChange={handleInputChange} />
            <FormField label="District" name="details.organization_district" value={details.organization_district} onChange={handleInputChange} />
            <FormField label="State" name="details.organization_state" value={details.organization_state} onChange={handleInputChange} />
            <FormField label="Pincode" name="details.organization_pincode" value={details.organization_pincode} onChange={handleInputChange} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Type Specific Fields */}
      {isIndividual ? renderIndividualForm() : renderOrganizationForm()}
      
      {/* Notes Field */}
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Notes</h4>
        <FormField 
          label="" 
          name="general_notes" 
          type="textarea" 
          value={formData.general_notes} 
          onChange={handleInputChange} 
          placeholder="Add any additional notes here..." 
        />
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}