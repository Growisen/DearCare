'use client';

import React, { useState, useCallback } from 'react';
import { FormData, StaffRequirement } from '@/types/client.types';
import { StaffRequirements } from '@/components/open-form/StaffRequirements';
import { addIndividualClient, addOrganizationClient } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import InputField from '@/components/open-form/InputField';


export default function ClientFormPage() {
  const router = useRouter();
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

const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { id, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [id as keyof FormData]: value
  }));
}, []);

  const handleStaffRequirementsChange = (staffRequirements: StaffRequirement[], startDate?: string) => {
    setFormData(prev => ({
      ...prev,
      staffRequirements,
      staffReqStartDate: startDate !== undefined ? startDate : prev.staffReqStartDate
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      let result;
      
      if (clientType === 'individual') {
        // Validate required fields for individual client
        const requiredFields = [
          'requestorName', 'requestorPhone', 'requestorEmail',
          'relationToPatient', 'patientName', 'completeAddress',
          'serviceRequired', 'careDuration', 'startDate'
        ];

        for (const field of requiredFields) {
          if (!formData[field as keyof FormData]) {
            throw new Error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          }
        }

        // Submit individual client data
        result = await addIndividualClient({
          clientType,
          clientCategory: formData.clientCategory as 'DearCare',
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
        // Validate required fields for organization
        const requiredFields = [
          'organizationName', 'contactPersonName', 'contactPhone',
          'contactEmail', 'organizationAddress'
        ];

        for (const field of requiredFields) {
          if (!formData[field as keyof FormData]) {
            throw new Error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          }
        }

        // Validate staff requirements
        if (!formData.staffRequirements || formData.staffRequirements.length === 0) {
          throw new Error('Please add at least one staff requirement');
        }

        for (const requirement of formData.staffRequirements) {
          if (!requirement.staffType || !requirement.shiftType) {
            throw new Error('Please complete all staff requirements');
          }
        }

        // Submit organization client data
        result = await addOrganizationClient({
          clientType,
          clientCategory: formData.clientCategory as 'DearCare',
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
      
      // Show success toast notification
      toast.success(`Client added successfully!`);
      // Redirect to clients page or success page
      router.push('/clients');
      
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
    <div className="min-h-screen bg-slate-200">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

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

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">Client Registration Form</h1>
            <p className="text-sm text-gray-600 mt-1">Please fill out the form below to register a new client</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Client Category Section */}
            <div className="mb-8 border-b border-gray-200 pb-6 hidden">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Client Category</h2>
              <div className="flex gap-4">
                {[
                  { id: 'DearCare', label: 'DearCare' }
                ].map((type) => (
                  <div key={type.id} className="flex items-center">
                    <input
                      id={`category-${type.id}`}
                      type="radio"
                      name="clientCategory"
                      checked={formData.clientCategory === type.id}
                      onChange={() => setFormData(prev => ({ ...prev, clientCategory: type.id as 'DearCare' }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`category-${type.id}`} className="ml-2 block text-sm font-medium text-gray-700">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Type Section */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Client Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'individual', label: 'Individual' },
                  { id: 'organization', label: 'Organization' },
                  { id: 'hospital', label: 'Hospital' },
                  { id: 'carehome', label: 'Care Home' }
                ].map((type) => (
                  <div key={type.id} className="flex items-center">
                    <input
                      id={`type-${type.id}`}
                      type="radio"
                      name="clientType"
                      checked={clientType === type.id}
                      onChange={() => setClientType(type.id as 'individual' | 'organization' | 'hospital' | 'carehome')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`type-${type.id}`} className="ml-2 block text-sm font-medium text-gray-700">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>

              {clientType && (
                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
                  <h3 className="text-sm font-medium text-blue-700">Instructions for {clientType.charAt(0).toUpperCase() + clientType.slice(1)} Registration</h3>
                  {clientType === 'individual' && (
                    <p className="text-sm text-gray-600 mt-1">
                      Please provide information about both the requestor (you) and the patient. All fields marked with * are required. 
                      If you are registering for yourself, select &quot;Self&quot; as the relation to patient and fill the same details.
                    </p>
                  )}
                  {clientType === 'organization' && (
                    <p className="text-sm text-gray-600 mt-1">
                      Please provide your organization details and contact information. You&apos;ll need to specify staff requirements including 
                      staff types, counts, and shift types for each position needed.
                    </p>
                  )}
                  {clientType === 'hospital' && (
                    <p className="text-sm text-gray-600 mt-1">
                      For hospital registrations, include complete contact details and address information. Medical staff requirements 
                      should be specified with qualification levels and experience requirements in the additional notes.
                    </p>
                  )}
                  {clientType === 'carehome' && (
                    <p className="text-sm text-gray-600 mt-1">
                      For care home registrations, please specify the facility type, number of residents, and detailed staff requirements. 
                      Include any specific qualifications needed for specialized care in the additional notes.
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* Conditional Form Fields */}
            {clientType === 'individual' ? (
              // Individual Client Fields
              <>
                {/* Requestor Information */}
                <div className="mb-8 border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Requestor Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                      label="Your Full Name" 
                      placeholder="Enter your name" 
                      id="requestorName" 
                      value={formData.requestorName} 
                      onChange={handleInputChange}
                      required={true}
                    />
                    <InputField 
                      label="Your Phone Number" 
                      type="tel" 
                      placeholder="Enter your phone number" 
                      id="requestorPhone" 
                      value={formData.requestorPhone} 
                      onChange={handleInputChange}
                      required={true}
                    />
                    <InputField 
                      label="Your Email Address" 
                      type="email" 
                      placeholder="Enter your email address" 
                      id="requestorEmail" 
                      value={formData.requestorEmail} 
                      onChange={handleInputChange}
                      required={true}
                    />
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="relationToPatient">
                        Relation to Patient <span className="text-red-500">*</span>
                      </label>
                      <select 
                        id="relationToPatient" 
                        value={formData.relationToPatient} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select relation...</option>
                        <option value="self">Self</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Son/Daughter</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="mb-8 border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                      label="Patient's Full Name" 
                      placeholder="Enter patient's name" 
                      id="patientName" 
                      value={formData.patientName} 
                      onChange={handleInputChange}
                      required={true}
                    />
                    <InputField 
                      label="Patient's Age" 
                      type="number" 
                      placeholder="Enter patient's age" 
                      id="patientAge" 
                      value={formData.patientAge} 
                      onChange={handleInputChange}
                    />
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patientGender">
                        Patient&apos;s Gender
                      </label>
                      <select 
                        id="patientGender" 
                        value={formData.patientGender} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select gender...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <InputField 
                      label="Patient's Phone Number" 
                      type="tel" 
                      placeholder="Enter patient's phone number" 
                      id="patientPhone" 
                      value={formData.patientPhone} 
                      onChange={handleInputChange}
                    />
                    <div className="md:col-span-2">
                      <InputField 
                        label="Complete Address" 
                        placeholder="Enter patient's complete address" 
                        id="completeAddress" 
                        value={formData.completeAddress} 
                        onChange={handleInputChange}
                        required={true}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Organization/Hospital/Carehome Fields
              <div className="mb-8 border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Organization Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Organization Name" 
                    placeholder="Enter organization name" 
                    id="organizationName" 
                    value={formData.organizationName} 
                    onChange={handleInputChange}
                    required={true}
                  />
                  <InputField 
                    label="Contact Person Name" 
                    placeholder="Enter contact person name" 
                    id="contactPersonName" 
                    value={formData.contactPersonName} 
                    onChange={handleInputChange}
                    required={true}
                  />
                  <InputField 
                    label="Contact Person Role" 
                    placeholder="Enter role/designation" 
                    id="contactPersonRole" 
                    value={formData.contactPersonRole} 
                    onChange={handleInputChange}
                  />
                  <InputField 
                    label="Contact Phone" 
                    type="tel"
                    placeholder="Enter contact phone" 
                    id="contactPhone" 
                    value={formData.contactPhone} 
                    onChange={handleInputChange}
                    required={true}
                  />
                  <InputField 
                    label="Contact Email" 
                    type="email"
                    placeholder="Enter contact email" 
                    id="contactEmail" 
                    value={formData.contactEmail} 
                    onChange={handleInputChange}
                    required={true}
                  />
                  <div className="md:col-span-2">
                    <InputField 
                      label="Organization Address" 
                      placeholder="Enter complete address" 
                      id="organizationAddress" 
                      value={formData.organizationAddress} 
                      onChange={handleInputChange}
                      required={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Care Requirements Section */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {clientType === 'individual' ? 'Care Requirements' : 'Staff Requirements'}
              </h2>
              
              {clientType === 'individual' ? (
                // Individual Care Requirements
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="serviceRequired">
                      Service Required <span className="text-red-500">*</span>
                    </label>
                    <select 
                      id="serviceRequired" 
                      value={formData.serviceRequired} 
                      onChange={handleInputChange} 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select service...</option>
                      <option value="home_care">Home Care</option>
                      <option value="elder_care">Elder Care</option>
                      <option value="post_surgery">Post-Surgery Care</option>
                      <option value="physiotherapy">Physiotherapy</option>
                      <option value="palliative">Palliative Care</option>
                      <option value="disability">Disability Care</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="careDuration">
                      Care Duration <span className="text-red-500">*</span>
                    </label>
                    <select 
                      id="careDuration" 
                      value={formData.careDuration} 
                      onChange={handleInputChange} 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select duration...</option>
                      <option value="24_7">24/7 Care</option>
                      <option value="12_hours">12 Hour Shift</option>
                      <option value="day">Day Care</option>
                      <option value="night">Night Care</option>
                      <option value="weekly">Weekly Visits</option>
                    </select>
                  </div>
                  <InputField 
                    label="Start Date"
                    type="date" 
                    placeholder="Select start date" 
                    id="startDate" 
                    value={formData.startDate} 
                    onChange={handleInputChange}
                    required={true}
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="preferredCaregiverGender">
                      Preferred Caregiver Gender
                    </label>
                    <select 
                      id="preferredCaregiverGender" 
                      value={formData.preferredCaregiverGender} 
                      onChange={handleInputChange} 
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select preference...</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="any">No Preference</option>
                    </select>
                  </div>
                </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="generalNotes">
                  Additional Requirements
                </label>
                <textarea 
                  id="generalNotes" 
                  value={formData.generalNotes} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  placeholder={
                    clientType === 'individual' 
                      ? "Any special care instructions or requirements"
                      : "Additional staffing requirements, qualifications needed, or other specifications"
                  }
                ></textarea>
              </div>
            </div>

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
      </div>
    </div>
  );
}