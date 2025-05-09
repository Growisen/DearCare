import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FormData, AddClientProps, StaffRequirement } from '@/types/client.types';
import { addIndividualClient, addOrganizationClient } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';

import { StaffRequirements } from '../open-form/StaffRequirements';
import { ClientTypeSelector } from './ClientTypeSelector';
import { RequestorInfoForm } from '@/components/open-form/RequestorInfoForm';
import { PatientInfoForm } from '@/components/open-form/PatientInfoForm';
import { OrganizationInfoForm } from '@/components/open-form/OrganizationInfoForm';
import { IndividualCareRequirements } from '@/components/open-form/IndividualCareRequirements';

import { ClientCategorySelector } from './ClientCategorySelector';
import { DutyPeriodSelector } from './DutyPeriodSelector';
import { FormActions } from './FormActions';

interface FormErrors {
  [key: string]: string;
}

export function AddClientOverlay({ onClose, onAdd }: AddClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientType, setClientType] = useState<'individual' | 'organization' | 'hospital' | 'carehome'>('individual');
  
  const [formData, setFormData] = useState<FormData>({
    // Common Fields
    clientType: 'individual',
    clientCategory: 'DearCare',

    dutyPeriod: '',
    dutyPeriodReason: '',
    
    // Individual Client Fields
    requestorName: '',
    requestorPhone: '',
    requestorEmail: '',
    requestorAddress: '',
    requestorJobDetails: '',
    requestorEmergencyPhone: '',
    requestorPincode: '',
    requestorDistrict: '',
    requestorCity: '',
    relationToPatient: '',
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    patientAddress: '', 
    patientPincode: '',
    patientDistrict: '',
    patientCity: '',
    patientProfilePic: null,
    requestorProfilePic: null,
    
    // Organization/Hospital/Carehome Fields
    organizationName: '',
    organizationType: '',
    contactPersonName: '',
    contactPersonRole: '',
    contactPhone: '',
    contactEmail: '',
    organizationState: '',
    organizationDistrict: '',
    organizationCity: '',
    organizationAddress: '',
    organizationPincode: '',
    
    // Care Requirements (Common)
    serviceRequired: '',
    careDuration: '',
    startDate: '',
    preferredCaregiverGender: '',
    generalNotes: '',

    // Staff Requirements (for non-individual clients)
    staffRequirements: [{
      staffType: '',
      count: 1,
      shiftType: ''
    }],
    staffReqStartDate: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validateField = (id: string, value: string): string => {
    if (!value.trim()) return '';
    
    switch (id) {
      case 'requestorEmail':
      case 'contactEmail':
        return validateEmail(value);
      case 'requestorPhone':
      case 'patientPhone':
      case 'contactPhone':
        return validatePhone(value);
      case 'patientAge':
        return validateAge(value);
      case 'patientGender':
      case 'preferredCaregiverGender':
        return value === '' ? 'Please select a gender option' : '';
      case 'serviceRequired':
        return value === '' ? 'Please select a required service' : '';
      case 'careDuration':
        return value === '' ? 'Please select a care duration' : '';
      case 'dutyPeriod':
        return value === '' ? 'Please select a duty period' : '';
      case 'dutyPeriodReason':
        if (formData.dutyPeriod === 'above_3_months' && !value.trim()) {
          return 'Please provide a reason for extended duration';
        }
        return '';
      case 'startDate':
      case 'staffReqStartDate':
        return isValidDate(value) ? '' : 'Please enter a valid date';
      default:
        return '';
    }
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address';
  };

  const validatePhone = (phone: string): string => {
    const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
    return phoneRegex.test(phone) ? '' : 'Please enter a valid phone number';
  };

  const validateAge = (age: string): string => {
    const ageNum = Number(age);
    if (isNaN(ageNum)) return 'Age must be a number';
    if (ageNum <= 0 || ageNum > 120) return 'Please enter a valid age';
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id as keyof FormData]: value
    }));
      
    // Clear error when user starts typing
    if (formErrors[id]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const handleBlur = (id: string) => {
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [id]: true
    }));

    // Validate field
    const value = formData[id as keyof FormData] as string;
    const error = validateField(id, value);
    
    // Set error if field is required and empty
    const isRequired = isRequiredField(id, clientType);
    const isEmpty = !value.trim();
    
    setFormErrors(prev => ({
      ...prev,
      [id]: error || (touched[id] && isRequired && isEmpty ? `${fieldLabels[id] || 'This field'} is required` : '')
    }));
  };

  // Helper to determine if a field is required based on client type
  const isRequiredField = (id: string, type: 'individual' | 'organization' | 'hospital' | 'carehome'): boolean => {
    const commonRequired = ['dutyPeriod'];

    if (id === 'dutyPeriodReason' && formData.dutyPeriod === 'above_3_months') {
      return true;
    }

    const individualRequired = [
      'requestorName', 'requestorPhone', 'requestorEmail',
      'relationToPatient', 'patientName', 'patientAge', 'patientGender',
      'serviceRequired', 'careDuration', 'startDate',
      'requestorAddress', 'requestorPincode', 'requestorCity', 'requestorDistrict',
      'patientAddress', 'patientPincode', 'patientCity', 'patientDistrict'
    ];
    
    const organizationRequired = [
      'organizationName', 'organizationType', 'contactPersonName', 
      'contactPersonRole', 'contactPhone', 'contactEmail', 
      'organizationAddress', 'staffReqStartDate'
    ];
    
    return commonRequired.includes(id) || (type === 'individual' 
      ? individualRequired.includes(id)
      : organizationRequired.includes(id));
  };

  // Field labels for error messages
    const fieldLabels: {[key: string]: string} = {
    dutyPeriod: 'Duty period',
    dutyPeriodReason: 'Reason for extended duration',
    requestorName: 'Your name',
    requestorPhone: 'Your phone number',
    requestorEmail: 'Your email address',
    relationToPatient: 'Relation to patient',
    patientName: 'Patient name',
    patientAge: 'Patient age',
    patientGender: 'Patient gender',
    patientPhone: 'Patient phone number',
    serviceRequired: 'Service required',
    careDuration: 'Care duration',
    startDate: 'Start date',
    organizationName: 'Organization name',
    organizationType: 'Organization type',
    contactPersonName: 'Contact person name',
    contactPersonRole: 'Contact person role',
    contactPhone: 'Contact phone',
    contactEmail: 'Contact email',
    organizationAddress: 'Organization address',
    preferredCaregiverGender: 'Preferred caregiver gender',
    staffReqStartDate: 'Staff requirement start date',
    requestorAddress: 'Your address',
    requestorPincode: 'Your pincode',
    requestorCity: 'Your city',
    requestorDistrict: 'Your district',
    patientAddress: 'Patient address',
    patientPincode: 'Patient pincode',
    patientCity: 'Patient city',
    patientDistrict: 'Patient district',
    requestorJobDetails: 'Your job details',
    requestorEmergencyPhone: 'Emergency contact number'
  };

  const handleStaffRequirementsChange = (staffRequirements: StaffRequirement[]) => {
    setFormData(prev => ({
      ...prev,
      staffRequirements
    }));
  };

  const handleClientCategoryChange = (category: 'DearCare' | 'TataLife') => {
    setFormData(prev => ({
      ...prev,
      clientCategory: category
    }));
  };

  const handleClientTypeChange = (type: 'individual' | 'organization' | 'hospital' | 'carehome') => {
    setClientType(type);
    setFormData(prev => ({
      ...prev,
      clientType: type
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const commonRequired = ['dutyPeriod'];
    
    if (formData.dutyPeriod === 'above_3_months' && !formData.dutyPeriodReason.trim()) {
      newErrors.dutyPeriodReason = 'Please provide a reason for extended duration';
      isValid = false;
    }
    
    const requiredFields = [
      ...commonRequired,
      ...(clientType === 'individual' 
        ? ['requestorName', 'requestorPhone', 'requestorEmail', 'relationToPatient', 
           'patientName', 'patientAge', 'patientGender', 
           'serviceRequired', 'careDuration', 'startDate',
           'requestorAddress', 'requestorPincode', 'requestorCity', 'requestorDistrict',
           'patientAddress', 'patientPincode', 'patientCity', 'patientDistrict']
        : ['organizationName', 'organizationType', 'contactPersonName', 'contactPersonRole',
           'contactPhone', 'contactEmail', 'organizationAddress', 'staffReqStartDate'])
    ];
    
    // Check required fields
    for (const field of requiredFields) {
      const value = formData[field as keyof FormData];
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field] = `${fieldLabels[field] || 'This field'} is required`;
        isValid = false;
      }
    }
    
    // Validate field formats
    for (const field of Object.keys(formData)) {
      const value = formData[field as keyof FormData];
      if (typeof value === 'string' && value.trim()) {
        const error = validateField(field, value);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    }
    
    // Validate staff requirements for organizations
    if (clientType !== 'individual') {
      if (!formData.staffRequirements || formData.staffRequirements.length === 0) {
        newErrors.staffRequirements = 'Please add at least one staff requirement';
        isValid = false;
      } else {
        for (let i = 0; i < formData.staffRequirements.length; i++) {
          const req = formData.staffRequirements[i];
          if (!req.staffType || !req.shiftType) {
            newErrors[`staffRequirement-${i}`] = 'Please complete all staff requirement fields';
            isValid = false;
            break;
          }
        }
      }
      
      if (!formData.staffReqStartDate) {
        newErrors.staffReqStartDate = 'Start date is required';
        isValid = false;
      }
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    
    try {
      setIsSubmitting(true);
      let result;
      
      if (clientType === 'individual') {
        // Submit individual client data
        result = await addIndividualClient({
          clientType,
          clientCategory: formData.clientCategory as 'DearCare' | 'TataLife',
          generalNotes: formData.generalNotes,
          dutyPeriod: formData.dutyPeriod,
          dutyPeriodReason: formData.dutyPeriodReason,
          requestorName: formData.requestorName,
          requestorPhone: formData.requestorPhone,
          requestorEmail: formData.requestorEmail,
          relationToPatient: formData.relationToPatient,
          requestorAddress: formData.requestorAddress,
          requestorJobDetails: formData.requestorJobDetails,
          requestorEmergencyPhone: formData.requestorEmergencyPhone,
          requestorPincode: formData.requestorPincode,
          requestorDistrict: formData.requestorDistrict,
          requestorCity: formData.requestorCity,
          patientName: formData.patientName,
          patientAge: formData.patientAge,
          patientGender: formData.patientGender,
          patientPhone: formData.patientPhone || '',
          patientAddress: formData.patientAddress,
          patientPincode: formData.patientPincode,
          patientDistrict: formData.patientDistrict,
          patientCity: formData.patientCity,     
          serviceRequired: formData.serviceRequired,
          careDuration: formData.careDuration,
          startDate: formData.startDate,
          preferredCaregiverGender: formData.preferredCaregiverGender || '',
          patientProfilePic: formData.patientProfilePic,
          requestorProfilePic: formData.requestorProfilePic,
        });
        
      } else {
        // Submit organization client data
        result = await addOrganizationClient({
          clientType,
          clientCategory: formData.clientCategory as 'DearCare' | 'TataLife',
          generalNotes: formData.generalNotes,
          dutyPeriod: formData.dutyPeriod,
          dutyPeriodReason: formData.dutyPeriodReason,
          organizationName: formData.organizationName,
          organizationType: formData.organizationType || '',
          contactPersonName: formData.contactPersonName,
          contactPersonRole: formData.contactPersonRole || '',
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          organizationState: formData.organizationState || '',
          organizationDistrict: formData.organizationDistrict,
          organizationCity: formData.organizationCity,
          organizationPincode: formData.organizationPincode || '',
          organizationAddress: formData.organizationAddress,
          staffRequirements: formData.staffRequirements,
          staffReqStartDate: formData.staffReqStartDate || '',
        });
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to add client');
      }
      
      toast.success(`${clientType === 'individual' ? 'Individual' : 'Organization'} client added successfully!`);
      
      if (onAdd) onAdd();
      else onClose();
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error adding client:', errorMessage);
      toast.error(errorMessage);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-300">
    <div className="bg-white w-full md:w-11/12 lg:w-4/5 xl:max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border border-gray-100">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
        
        <div className="px-6 py-6 space-y-8 md:px-8">
          {/* Client Category Selection */}
          <ClientCategorySelector 
            selectedCategory={formData.clientCategory} 
            onCategoryChange={handleClientCategoryChange} 
          />

          {/* Client Type Selection */}
          <ClientTypeSelector 
            selectedType={clientType} 
            onTypeChange={handleClientTypeChange}
          />

          {/* Conditional Form Fields */}
          {clientType === 'individual' ? (
            // Individual Client Fields
            <>
              <RequestorInfoForm 
                formData={formData} 
                formErrors={formErrors}
                handleInputChange={handleInputChange}
                handleBlur={handleBlur}
                handleProfileImageChange={(field, file) => {
                  setFormData(prev => ({
                    ...prev,
                    [field]: file
                  }));
                }}
              />


              <PatientInfoForm 
                formData={formData}
                formErrors={formErrors} 
                handleBlur={handleBlur}
                handleInputChange={handleInputChange} 
                handleProfileImageChange={(field, file) => {
                  setFormData(prev => ({
                    ...prev,
                    [field]: file
                  }));
                }}
              />
            </>
          ) : (
            // Organization/Hospital/Carehome Fields
            <OrganizationInfoForm 
              formData={formData}
              formErrors={formErrors} 
              handleBlur={handleBlur} 
              handleInputChange={handleInputChange} 
            />
          )}

          {/* Care Requirements Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {clientType === 'individual' ? 'Care Requirements' : 'Staff Requirements'}
            </h3>

            <div className="mb-6">
              <DutyPeriodSelector
                dutyPeriod={formData.dutyPeriod}
                dutyPeriodReason={formData.dutyPeriodReason}
                formErrors={formErrors}
                handleInputChange={handleInputChange}
                handleBlur={handleBlur}
              />
            </div>
            
            {clientType === 'individual' ? (
              // Individual Care Requirements
              <IndividualCareRequirements 
                formData={formData}
                formErrors={formErrors} 
                handleBlur={handleBlur}  
                handleInputChange={handleInputChange} 
              />
            ) : (
              // Organization Staff Requirements
              <StaffRequirements 
                clientType={clientType}
                formData={{
                  staffRequirements: formData.staffRequirements,
                  staffReqStartDate: formData.staffReqStartDate
                }}
                onChange={handleStaffRequirementsChange}
              />
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Requirements</label>
              <textarea 
                id="generalNotes" 
                value={formData.generalNotes} 
                onChange={handleInputChange} 
                className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20"
                placeholder={
                  clientType === 'individual' 
                    ? "Any special care instructions or requirements"
                    : "Additional staffing requirements, qualifications needed, or other specifications"
                }
              ></textarea>
            </div>
          </div>

          {/* Form Actions */}
          <FormActions 
            onCancel={onClose} 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}