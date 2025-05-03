import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FormData, AddClientProps, StaffRequirement } from '@/types/client.types';
import { StaffRequirements } from '../open-form/StaffRequirements';
import { addIndividualClient, addOrganizationClient } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';

import { ClientCategorySelector } from './ClientCategorySelector';
import { ClientTypeSelector } from './ClientTypeSelector';
import { RequestorInfoForm } from './RequestorInfoForm';
import { PatientInfoForm } from './PatientInfoForm';
import { OrganizationInfoForm } from './OrganizationInfoForm';
import { IndividualCareRequirements } from './IndividualCareRequirements';
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
    
    // Individual Client Fields
    requestorName: '',
    requestorPhone: '',
    requestorEmail: '',
    relationToPatient: '',
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    completeAddress: '',
    
    // Organization/Hospital/Carehome Fields
    organizationName: '',
    organizationType: '',
    contactPersonName: '',
    contactPersonRole: '',
    contactPhone: '',
    contactEmail: '',
    organizationAddress: '',
    
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

  // Field validation functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateField = (id: string, value: string, formType: 'individual' | 'organization' | 'hospital' | 'carehome'): string => {
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
    const error = validateField(id, value, clientType);
    
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
    const individualRequired = [
      'requestorName', 'requestorPhone', 'requestorEmail',
      'relationToPatient', 'patientName', 'patientAge', 'patientGender',
      'completeAddress', 'serviceRequired', 'careDuration', 'startDate'
    ];
    
    const organizationRequired = [
      'organizationName', 'organizationType', 'contactPersonName', 
      'contactPersonRole', 'contactPhone', 'contactEmail', 
      'organizationAddress', 'staffReqStartDate'
    ];
    
    return type === 'individual' 
      ? individualRequired.includes(id)
      : organizationRequired.includes(id);
  };

  // Field labels for error messages
  const fieldLabels: {[key: string]: string} = {
    requestorName: 'Your name',
    requestorPhone: 'Your phone number',
    requestorEmail: 'Your email address',
    relationToPatient: 'Relation to patient',
    patientName: 'Patient name',
    patientAge: 'Patient age',
    patientGender: 'Patient gender',
    patientPhone: 'Patient phone number',
    completeAddress: 'Complete address',
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
    // Implementation remains the same
    // ...
    const newErrors: FormErrors = {};
    let isValid = true;
    
    const requiredFields = clientType === 'individual' 
      ? ['requestorName', 'requestorPhone', 'requestorEmail', 'relationToPatient', 
         'patientName', 'patientAge', 'patientGender', 'completeAddress', 
         'serviceRequired', 'careDuration', 'startDate']
      : ['organizationName', 'organizationType', 'contactPersonName', 'contactPersonRole',
         'contactPhone', 'contactEmail', 'organizationAddress', 'staffReqStartDate'];
    
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
        const error = validateField(field, value, clientType);
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
          requestorName: formData.requestorName,
          requestorPhone: formData.requestorPhone,
          requestorEmail: formData.requestorEmail,
          relationToPatient: formData.relationToPatient,
          patientName: formData.patientName,
          patientAge: formData.patientAge,
          patientGender: formData.patientGender,
          patientPhone: formData.patientPhone || '',
          completeAddress: formData.completeAddress,
          serviceRequired: formData.serviceRequired,
          careDuration: formData.careDuration,
          startDate: formData.startDate,
          preferredCaregiverGender: formData.preferredCaregiverGender || '',
        });
        
      } else {
        // Submit organization client data
        result = await addOrganizationClient({
          clientType,
          clientCategory: formData.clientCategory as 'DearCare' | 'TataLife',
          generalNotes: formData.generalNotes,
          organizationName: formData.organizationName,
          organizationType: formData.organizationType || '',
          contactPersonName: formData.contactPersonName,
          contactPersonRole: formData.contactPersonRole || '',
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-6">
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
                formData={{
                  requestorName: formData.requestorName,
                  requestorPhone: formData.requestorPhone,
                  requestorEmail: formData.requestorEmail,
                  relationToPatient: formData.relationToPatient
                }}
                formErrors={formErrors}
                handleInputChange={handleInputChange}
                handleBlur={handleBlur}
              />

              <PatientInfoForm 
                formData={{
                  patientName: formData.patientName,
                  patientAge: formData.patientAge,
                  patientGender: formData.patientGender,
                  patientPhone: formData.patientPhone,
                  completeAddress: formData.completeAddress
                }}
                formErrors={formErrors}
                handleInputChange={handleInputChange}
                handleBlur={handleBlur}
              />
            </>
          ) : (
            // Organization/Hospital/Carehome Fields
            <OrganizationInfoForm 
              formData={{
                organizationName: formData.organizationName,
                organizationType: formData.organizationType,
                contactPersonName: formData.contactPersonName,
                contactPersonRole: formData.contactPersonRole,
                contactPhone: formData.contactPhone,
                contactEmail: formData.contactEmail,
                organizationAddress: formData.organizationAddress
              }}
              formErrors={formErrors}
              handleInputChange={handleInputChange}
              handleBlur={handleBlur}
            />
          )}

          {/* Care Requirements Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {clientType === 'individual' ? 'Care Requirements' : 'Staff Requirements'}
            </h3>
            
            {clientType === 'individual' ? (
              // Individual Care Requirements
              <IndividualCareRequirements
                formData={{
                  serviceRequired: formData.serviceRequired,
                  careDuration: formData.careDuration,
                  startDate: formData.startDate,
                  preferredCaregiverGender: formData.preferredCaregiverGender
                }}
                formErrors={formErrors}
                handleInputChange={handleInputChange}
                handleBlur={handleBlur}
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