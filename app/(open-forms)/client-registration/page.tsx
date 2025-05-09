'use client';

import React, { useState, useCallback } from 'react';
import { FormData, StaffRequirement } from '@/types/client.types';
import { StaffRequirements } from '@/components/open-form/StaffRequirements';
import { addIndividualClient, addOrganizationClient } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { ClientTypeSelector } from '@/components/open-form/ClientTypeSelector';
import { RequestorInfoForm } from '@/components/open-form/RequestorInfoForm';
import { PatientInfoForm } from '@/components/open-form/PatientInfoForm';
import { OrganizationInfoForm } from '@/components/open-form/OrganizationInfoForm';
import { IndividualCareRequirements } from '@/components/open-form/IndividualCareRequirements';
import { SuccessMessage } from '@/components/open-form/SuccessMessage';
import { DutyPeriodSelector } from '@/components/add-client-overlay/DutyPeriodSelector';

interface FormErrors {
  [key: string]: string;
}

export default function ClientFormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientType, setClientType] = useState<'individual' | 'organization' | 'hospital' | 'carehome'>('individual');
  const [isSuccess, setIsSuccess] = useState(false);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const [formData, setFormData] = useState<FormData>({
    clientType: 'individual',
    clientCategory: 'DearCare',
    
    dutyPeriod: '',
    dutyPeriodReason: '',

    requestorName: '',
    requestorPhone: '',
    requestorEmail: '',
    relationToPatient: '',

    requestorAddress: '',
    requestorJobDetails: '',
    requestorEmergencyPhone: '',
    requestorPincode: '',
    requestorDistrict: '',
    requestorCity: '',
    
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',

    patientAddress: '',
    patientPincode: '',
    patientDistrict: '',
    patientCity: '',
    
    requestorProfilePic: null,
    patientProfilePic: null,

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
    
    serviceRequired: '',
    careDuration: '',
    startDate: '',
    preferredCaregiverGender: '',
    generalNotes: '',

    staffRequirements: [{
      staffType: '',
      count: 1,
      shiftType: ''
    }],
    staffReqStartDate: '',
  });

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
    organizationState: 'Organization state',
    organizationDistrict: 'Organization district',
    organizationCity: 'Organization city',
    organizationAddress: 'Organization address',
    organizationPincode: 'Organization pincode',
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
  };

  // Field validation functions
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
      'organizationState', 'organizationDistrict', 'organizationCity',
      'organizationAddress', 'organizationPincode', 'staffReqStartDate'
    ];
    
    return commonRequired.includes(id) || (type === 'individual' 
      ? individualRequired.includes(id)
      : organizationRequired.includes(id));
  };

  // Updated handleInputChange to clear errors
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
  }, [formErrors]);

  const handleBlur = (id: string) => {
    setTouched(prev => ({
      ...prev,
      [id]: true
    }));

    // Validate field
    const value = formData[id as keyof FormData] as string;
    const error = validateField(id, value);
    
    // Set error if field is required and empty
    const isRequired = isRequiredField(id, clientType);
    const isEmpty = !value || (typeof value === 'string' && !value.trim());
    
    setFormErrors(prev => ({
      ...prev,
      [id]: error || (touched[id] && isRequired && isEmpty ? `${fieldLabels[id] || 'This field'} is required` : '')
    }));
  };

  const handleProfileImageChange = (field: 'requestorProfilePic' | 'patientProfilePic', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleStaffRequirementsChange = (staffRequirements: StaffRequirement[], startDate?: string) => {
    setFormData(prev => ({
      ...prev,
      staffRequirements,
      staffReqStartDate: startDate !== undefined ? startDate : prev.staffReqStartDate
    }));
  };

  // Validate all fields before submission
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const commonRequired = ['dutyPeriod'];
    
    if (formData.dutyPeriod === 'above_3_months' && !formData.dutyPeriodReason?.trim()) {
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
           'contactPhone', 'contactEmail', 'organizationState', 'organizationDistrict', 'organizationCity',
            'organizationAddress', 'organizationPincode', 'staffReqStartDate'])
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

  // Updated handleSubmit to use validateForm
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      setIsSubmitting(true);
      let result;
      
      if (clientType === 'individual') {

        result = await addIndividualClient({
          clientType,
          clientCategory: formData.clientCategory as 'DearCare',
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
       
        result = await addOrganizationClient({
          clientType,
          clientCategory: formData.clientCategory as 'DearCare',
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
          organizationDistrict: formData.organizationDistrict || '',
          organizationCity: formData.organizationCity || '',
          organizationAddress: formData.organizationAddress,
          organizationPincode: formData.organizationPincode || '',
          staffRequirements: formData.staffRequirements,
          staffReqStartDate: formData.staffReqStartDate || '',
        });
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to add client');
      }

      setIsSuccess(true);
      // Redirect to clients page or success page
      setTimeout(() => {
        router.back();
      }, 5000);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error adding client:', errorMessage);
      
      toast.error(errorMessage);
    }
    finally{
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 pt-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-t-lg shadow-lg p-6 mb-2 border-b-4 border-dCblue flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center rounded-full p-3 mr-3 shadow-md bg-white border-2 border-dCblue">
              <div className="relative w-12 h-12">
                <Image
                  src="/DearCare.png"
                  alt="DearCare Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <div className="flex items-center whitespace-nowrap">
                  <span className='text-dCblue'>Dear</span><span className='text-amber-500'>C</span><span className='text-dCblue'>are</span>
                </div>
              </h1>
              <p className="text-sm text-gray-500">Healthcare & Caregiving Services</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-gray-600 font-medium">Client Support: <span className="text-blue-600">+1 (800) 123-4567</span></p>
            <p className="text-sm text-gray-600 mt-1">care@dearcare.com</p>
          </div>
        </div>

        {isSuccess ? (
          <SuccessMessage onGoBack={() => router.back()} />
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-800">Client Registration Form</h1>
              <p className="text-sm text-gray-600 mt-1">Please fill out the form below to register a new client</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Client Type Selection */}
              <ClientTypeSelector clientType={clientType} onClientTypeChange={setClientType} />

              {/* Conditional Form Fields */}
              {clientType === 'individual' ? (
                <>
                  {/* Requestor Information */}
                  <RequestorInfoForm 
                    formData={formData} 
                    formErrors={formErrors}
                    handleInputChange={handleInputChange}
                    handleBlur={handleBlur}
                    handleProfileImageChange={handleProfileImageChange}
                  />
                  
                  {/* Patient Information */}
                  <PatientInfoForm 
                    formData={formData}
                    formErrors={formErrors} 
                    handleBlur={handleBlur}
                    handleInputChange={handleInputChange} 
                    handleProfileImageChange={handleProfileImageChange} 
                  />
                </>
              ) : (
                <OrganizationInfoForm 
                  formData={formData}
                  formErrors={formErrors} 
                  handleBlur={handleBlur} 
                  handleInputChange={handleInputChange} 
                />
              )}

              {/* Care Requirements */}
              {clientType === 'individual' ? (
                <IndividualCareRequirements 
                  formData={formData}
                  formErrors={formErrors} 
                  handleBlur={handleBlur}  
                  handleInputChange={handleInputChange} 
                />
              ) : (
                <div className="mb-8 border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Staff Requirements</h2>
                  
                  <div className="mb-6">
                    <DutyPeriodSelector
                      dutyPeriod={formData.dutyPeriod}
                      dutyPeriodReason={formData.dutyPeriodReason}
                      formErrors={formErrors}
                      handleInputChange={handleInputChange}
                      handleBlur={handleBlur}
                    />
                  </div>
                  
                  <StaffRequirements 
                    clientType={clientType}
                    formData={{
                      staffRequirements: formData.staffRequirements,
                      staffReqStartDate: formData.staffReqStartDate
                    }}
                    onChange={handleStaffRequirementsChange}
                  />
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="generalNotes">
                      Additional Requirements
                    </label>
                    <textarea 
                      id="generalNotes" 
                      value={formData.generalNotes} 
                      onChange={handleInputChange} 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                      placeholder="Additional staffing requirements, qualifications needed, or other specifications"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}