import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FormData, AddClientProps, StaffRequirement } from '@/types/client.types';
import { StaffRequirements } from './StaffRequirements';
import { addIndividualClient, addOrganizationClient } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';

const InputField = ({ label, type = 'text', placeholder, id, value, onChange }: { label: string, type?: string, placeholder: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>{label}</label>
    <input
      type={type}
      id={id}
      className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
      placeholder={placeholder}
      aria-label={label}
      value={value}
      onChange={onChange}
    />
  </div>
);

export function AddClientOverlay({ onClose }: AddClientProps) {
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
    duration: '',
  });

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id as keyof FormData]: value
    }));
  };

  const handleStaffRequirementsChange = (staffRequirements: StaffRequirement[]) => {
    setFormData(prev => ({
      ...prev,
      staffRequirements
    }));
  };

  const handleSubmit = async () => {
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
          duration: formData.duration || '',
        });
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to add client');
      }
      
      // Show success toast notification
      toast.success(`${clientType === 'individual' ? 'Individual' : 'Organization'} client added successfully!`);
      
      // Close the overlay after successful submission
      onClose();
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error adding client:', errorMessage);
      
      // Show error toast notification instead of alert
      toast.error(errorMessage);
    }
    finally{
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-6">

          {/* Client Category Selection */}
          <div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'DearCare', label: 'DearCare' },
                { id: 'TataLife', label: 'Tata Life' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData(prev => ({ ...prev, clientCategory: type.id as 'DearCare' | 'TataLife' }))}
                  className={`p-3 rounded-lg border ${
                    formData.clientCategory === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-900 font-medium'
                  } transition-colors duration-200`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          {/* Client Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'individual', label: 'Individual' },
                { id: 'organization', label: 'Organization' },
                { id: 'hospital', label: 'Hospital' },
                { id: 'carehome', label: 'Care Home' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setClientType(type.id as 'individual' | 'organization' | 'hospital' | 'carehome')}
                  className={`p-3 rounded-lg border ${
                    clientType === type.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-900 font-medium'
                  } transition-colors duration-200`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Form Fields */}
          {clientType === 'individual' ? (
            // Individual Client Fields
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requestor Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    label="Your Full Name" 
                    placeholder="Enter your name" 
                    id="requestorName" 
                    value={formData.requestorName} 
                    onChange={handleInputChange} 
                  />
                  <InputField 
                    label="Your Phone Number" 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    id="requestorPhone" 
                    value={formData.requestorPhone} 
                    onChange={handleInputChange} 
                  />
                  <InputField 
                    label="Your Email Address" 
                    type="email" 
                    placeholder="Enter your email address" 
                    id="requestorEmail" 
                    value={formData.requestorEmail} 
                    onChange={handleInputChange} 
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relation to Patient</label>
                    <select 
                      id="relationToPatient" 
                      value={formData.relationToPatient} 
                      onChange={handleInputChange} 
                      className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    label="Patient's Full Name" 
                    placeholder="Enter patient's name" 
                    id="patientName" 
                    value={formData.patientName} 
                    onChange={handleInputChange} 
                  />
                  <InputField 
                    label="Patient's Age" 
                    type="number" 
                    placeholder="Enter patient's age" 
                    id="patientAge" 
                    value={formData.patientAge} 
                    onChange={handleInputChange} 
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient&apos;s Gender</label>
                    <select 
                      id="patientGender" 
                      value={formData.patientGender} 
                      onChange={handleInputChange} 
                      className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <div className="sm:col-span-2">
                    <InputField 
                      label="Complete Address" 
                      placeholder="Enter patient's complete address" 
                      id="completeAddress" 
                      value={formData.completeAddress} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Organization/Hospital/Carehome Fields
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Organization Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    label="Organization Name" 
                    placeholder="Enter organization name" 
                    id="organizationName" 
                    value={formData.organizationName} 
                    onChange={handleInputChange} 
                  />
                  <InputField 
                    label="Contact Person Name" 
                    placeholder="Enter contact person name" 
                    id="contactPersonName" 
                    value={formData.contactPersonName} 
                    onChange={handleInputChange} 
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
                  />
                  <InputField 
                    label="Contact Email" 
                    type="email"
                    placeholder="Enter contact email" 
                    id="contactEmail" 
                    value={formData.contactEmail} 
                    onChange={handleInputChange} 
                  />
                  <div className="sm:col-span-2">
                    <InputField 
                      label="Organization Address" 
                      placeholder="Enter complete address" 
                      id="organizationAddress" 
                      value={formData.organizationAddress} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Care Requirements Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {clientType === 'individual' ? 'Care Requirements' : 'Staff Requirements'}
            </h3>
            
            {clientType === 'individual' ? (
              // Individual Care Requirements
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Required</label>
                  <select 
                    id="serviceRequired" 
                    value={formData.serviceRequired} 
                    onChange={handleInputChange} 
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Care Duration</label>
                  <select 
                    id="careDuration" 
                    value={formData.careDuration} 
                    onChange={handleInputChange} 
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Caregiver Gender</label>
                  <select 
                    id="preferredCaregiverGender" 
                    value={formData.preferredCaregiverGender} 
                    onChange={handleInputChange} 
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  duration: formData.duration
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
          <div className="flex gap-3 pt-3">
            <button onClick={onClose} className="px-5 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition duration-200">
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1 px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              {isSubmitting ? 'Adding Client...' : 'Add Client'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}