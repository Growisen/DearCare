import React, { useState, useRef, useEffect } from 'react';
import { DetailedClientIndividual, DetailedClientOrganization } from '@/types/client.types';
import { updateIndividualClientProfile, updateOrganizationDetails } from '@/app/actions/clients/client-actions';
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
  const activeElementRef = useRef<string | null>(null);
  const activeElementSelectionStart = useRef<number | null>(null);
  const activeElementSelectionEnd = useRef<number | null>(null);
  
  const [isLessThanOneYear, setIsLessThanOneYear] = useState(false);

  const isIndividual = client.client_type === 'individual';
  const isBabyCare = isIndividual && (formData as DetailedClientIndividual).details?.service_required === 'baby_care';

  useEffect(() => {
    if (isBabyCare && isIndividual) {
      const details = (client as DetailedClientIndividual).details || {};
      const ageValue = details.patient_age?.toString() || '';
      const isMonthFormat = /\d+\s*months?$/.test(ageValue);
      setIsLessThanOneYear(isMonthFormat);
    }
  }, [client, isBabyCare, isIndividual]);

  const saveActiveElementState = () => {
    if (document.activeElement instanceof HTMLInputElement || 
        document.activeElement instanceof HTMLTextAreaElement) {
      activeElementRef.current = document.activeElement.id;
      activeElementSelectionStart.current = document.activeElement.selectionStart;
      activeElementSelectionEnd.current = document.activeElement.selectionEnd;
    }
  };

  useEffect(() => {
    if (activeElementRef.current) {
      const element = document.getElementById(activeElementRef.current);
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.focus();
        if (activeElementSelectionStart.current !== null && activeElementSelectionEnd.current !== null) {
          element.selectionStart = activeElementSelectionStart.current;
          element.selectionEnd = activeElementSelectionEnd.current;
        }
      }
    }
  }, [formData]);

  const getSelectedMonth = () => {
    if (isIndividual) {
      const details = (formData as DetailedClientIndividual).details || {};
      const ageValue = details.patient_age?.toString() || '';
      const match = ageValue.match(/^(\d+)/);
      return match ? match[1] : '';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    saveActiveElementState();
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prevData => {
        const parentObj = { ...(prevData[parent as keyof typeof prevData] as Record<string, string | number | boolean | null | undefined> || {}) };
        
        if (isBabyCare && child === 'patient_age' && isLessThanOneYear) {
          const monthValue = parseInt(value);
          if (!isNaN(monthValue)) {
            parentObj[child] = `${monthValue} ${monthValue === 1 ? 'month' : 'months'}`;
          } else {
            parentObj[child] = value;
          }
        } else {
          parentObj[child] = value;
        }
        
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

  const handleAgeGroupChange = (isMonths: boolean) => {
    setIsLessThanOneYear(isMonths);

    if (isIndividual) {
      setFormData(prevData => {
        const prevIndividual = prevData as DetailedClientIndividual;
        const details = { ...(prevIndividual.details || {}) };
        details.patient_age = '';
        return {
          ...prevData,
          details
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (isIndividual) {
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
            patientProfilePic: null,
        
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
            requestorProfilePic: null,
        
            relationToPatient: details.relation_to_patient || null,
            requestorEmergencyPhone: details.requestor_emergency_phone || null,
            requestorJobDetails: details.requestor_job_details || null,
          });
        }
      } else {
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

  const baseInputStyles = `
    w-full border border-slate-200 bg-white rounded-sm py-2 px-3 text-sm text-gray-800 
    placeholder:text-gray-400
    focus:border-slate-200 focus:outline-none focus:ring-0 
    transition-colors duration-200 appearance-none
  `;
  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
  const sectionStyles = "p-5 bg-white rounded-sm border border-slate-200 mb-4";
  const sectionHeaderStyles = "text-xs font-semibold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2";

  const FormField = ({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    options = [],
    placeholder = '',
    required = false,
    min
  }: { 
    label: string; 
    name: string; 
    type?: string; 
    value: string | number | null | undefined; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    options?: Array<{value: string; label: string}>;
    placeholder?: string;
    required?: boolean;
    min?: number;
  }) => {
    const inputId = name.replace('.', '_');
    
    return (
      <div>
        <label htmlFor={inputId} className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {type === 'select' ? (
          <select
            id={inputId}
            name={name}
            value={value || ''}
            onChange={onChange}
            className={baseInputStyles}
            required={required}
            style={{ backgroundImage: 'none' }}
          >
            <option value="" className="text-gray-400">Select {label}</option>
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
            className={baseInputStyles}
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
            className={baseInputStyles}
            required={required}
            min={min}
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
        <div className={sectionStyles}>
          <h4 className={sectionHeaderStyles}>Requestor Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <FormField label="Requestor Name" name="details.requestor_name" value={details.requestor_name} onChange={handleInputChange} required />
                <FormField
                  label="Relation to Patient"
                  name="details.relation_to_patient"
                  type="select"
                  value={details.relation_to_patient}
                  onChange={handleInputChange}
                  options={relationOptions}
                />
                <FormField label="Requestor Email" name="details.requestor_email" type="email" value={details.requestor_email} onChange={handleInputChange} />
                <FormField label="Requestor Phone" name="details.requestor_phone" value={details.requestor_phone} onChange={handleInputChange} required />
                <FormField label="Emergency Phone" name="details.requestor_emergency_phone" value={details.requestor_emergency_phone} onChange={handleInputChange} />
                <FormField label="Job Details" name="details.requestor_job_details" value={details.requestor_job_details} onChange={handleInputChange} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Requestor Address</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <FormField label="Address" name="details.requestor_address" type="textarea" value={details.requestor_address} onChange={handleInputChange} />
                <FormField label="City" name="details.requestor_city" value={details.requestor_city} onChange={handleInputChange} />
                <FormField label="District" name="details.requestor_district" value={details.requestor_district} onChange={handleInputChange} />
                <FormField label="State" name="details.requestor_state" value={details.requestor_state} onChange={handleInputChange} />
                <FormField label="Pincode" name="details.requestor_pincode" value={details.requestor_pincode} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        <div className={sectionStyles}>
          <h4 className={sectionHeaderStyles}>Patient Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Personal Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <FormField label="Patient Name" name="details.patient_name" value={details.patient_name} onChange={handleInputChange} />
                
                {isBabyCare ? (
                  <div className="col-span-1 sm:col-span-2">
                    <div className="mb-3">
                      <label className={labelStyles}>Baby&apos;s Age Group</label>
                      <div className="flex gap-6">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="ageGroup"
                            checked={isLessThanOneYear}
                            onChange={() => handleAgeGroupChange(true)}
                            className="h-3.5 w-3.5 text-gray-700 border-slate-200 focus:ring-0"
                          />
                          <span className="ml-2 text-sm text-gray-700">Less than 1 year</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="ageGroup"
                            checked={!isLessThanOneYear}
                            onChange={() => handleAgeGroupChange(false)}
                            className="h-3.5 w-3.5 text-gray-700 border-slate-200 focus:ring-0"
                          />
                          <span className="ml-2 text-sm text-gray-700">1 year or older</span>
                        </label>
                      </div>
                    </div>
                    
                    {isLessThanOneYear ? (
                      <div>
                        <label className={labelStyles} htmlFor="details_patient_age">
                          Baby&apos;s Age (in months)
                        </label>
                        <select
                          id="details_patient_age"
                          name="details.patient_age"
                          value={getSelectedMonth()}
                          onChange={handleInputChange}
                          className={baseInputStyles}
                        >
                          <option value="">Select month...</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i} value={i + 1}>
                              {i + 1} {i === 0 ? 'month' : 'months'}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <FormField
                        label="Patient Age"
                        name="details.patient_age"
                        type="number"
                        value={details.patient_age}
                        onChange={handleInputChange}
                        min={1}
                      />
                    )}
                  </div>
                ) : (
                  <FormField
                    label="Patient Age"
                    name="details.patient_age"
                    type="number"
                    value={details.patient_age}
                    onChange={handleInputChange}
                  />
                )}
                
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
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patient Address</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <FormField 
                  label="Address" 
                  name="details.patient_address" 
                  type="textarea" 
                  value={details.patient_address || details.complete_address} 
                  onChange={handleInputChange}
                />
                <FormField label="City" name="details.patient_city" value={details.patient_city} onChange={handleInputChange} />
                <FormField label="District" name="details.patient_district" value={details.patient_district} onChange={handleInputChange} />
                <FormField label="State" name="details.patient_state" value={details.patient_state} onChange={handleInputChange} />
                <FormField label="Pincode" name="details.patient_pincode" value={details.patient_pincode} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        <div className={sectionStyles}>
          <h4 className={sectionHeaderStyles}>Care Requirements</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
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
              required
            />
            <FormField label="Expected Start Date" name="details.start_date" type="date" value={details.start_date} onChange={handleInputChange} />
            <div className="md:col-span-3">
              <FormField 
                label="Period Reason" 
                name="duty_period_reason" 
                type="textarea" 
                value={individualClient.duty_period_reason} 
                onChange={handleInputChange} 
                placeholder="Please provide details about the care duration requirements..."
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderOrganizationForm = () => {
    const orgClient = formData as DetailedClientOrganization;
    const details = orgClient.details || {};
    
    return (
      <div className={sectionStyles}>
        <h4 className={sectionHeaderStyles}>Organization Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-6">
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Organization Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Organization Name" name="details.organization_name" value={details.organization_name} onChange={handleInputChange} required />
            </div>
          </div>
          
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Person</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Contact Person Name" name="details.contact_person_name" value={details.contact_person_name} onChange={handleInputChange} required />
              <FormField label="Contact Person Role" name="details.contact_person_role" value={details.contact_person_role} onChange={handleInputChange} />
              <FormField label="Contact Email" name="details.contact_email" type="email" value={details.contact_email} onChange={handleInputChange} required />
              <FormField label="Contact Phone" name="details.contact_phone" value={details.contact_phone} onChange={handleInputChange} required />
            </div>
          </div>
        </div>
        
        <div>
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Organization Address</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <FormField label="Address" name="details.organization_address" type="textarea" value={details.organization_address} onChange={handleInputChange} required />
            <FormField label="City" name="details.organization_city" value={details.organization_city} onChange={handleInputChange} required />
            <FormField label="District" name="details.organization_district" value={details.organization_district} onChange={handleInputChange} />
            <FormField label="State" name="details.organization_state" value={details.organization_state} onChange={handleInputChange} required />
            <FormField label="Pincode" name="details.organization_pincode" value={details.organization_pincode} onChange={handleInputChange} required />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col h-full bg-gray-50/30">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 mb-0">
        {isIndividual ? renderIndividualForm() : renderOrganizationForm()}
        
        <div className={sectionStyles}>
          <h4 className={sectionHeaderStyles}>Additional Notes</h4>
          <FormField 
            label="Notes" 
            name="general_notes" 
            type="textarea" 
            value={formData.general_notes} 
            onChange={handleInputChange} 
            placeholder="Add any additional notes or special requirements here..." 
          />
        </div>
      </form>
      
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-5 py-3 flex justify-end items-center space-x-3 z-10 rounded-b-sm">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            const formElement = document.querySelector('form');
            if (formElement) {
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              formElement.dispatchEvent(submitEvent);
            }
          }}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-sm text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-0 transition-colors shadow-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}