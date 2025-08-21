'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useClientForm } from '@/hooks/useAddClient';
import { ClientFormComponent } from '@/components/client/AddClientForm';
import { SuccessMessage } from '@/components/open-form/SuccessMessage';

export default function ClientFormPage() {
  const router = useRouter();
  
  const { 
    formData, 
    formErrors, 
    clientType, 
    isSubmitting, 
    isSuccess,
    isSameAddress,
    handleInputChange,
    handleBlur,
    handleProfileImageChange,
    handleStaffRequirementsChange,
    handleClientTypeChange,
    handleSameAddressToggle,
    handleSubmit,
  } = useClientForm({
    onSuccess: () => {
      setTimeout(() => {
        router.back();
      }, 5000);
    }
  });

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
            <p className="text-sm text-gray-600 font-medium">Client Support: <span className="text-blue-600">+91 9645400035</span></p>
            <p className="text-sm text-gray-600 mt-1">info@dearcare.in</p>
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

            <ClientFormComponent
              formData={formData}
              formErrors={formErrors}
              clientType={clientType}
              isSubmitting={isSubmitting}
              isSameAddress={isSameAddress}
              handleInputChange={handleInputChange}
              handleBlur={handleBlur}
              handleProfileImageChange={handleProfileImageChange}
              handleStaffRequirementsChange={handleStaffRequirementsChange}
              handleClientTypeChange={handleClientTypeChange}
              handleSameAddressToggle={handleSameAddressToggle}
              handleSubmit={handleSubmit}
              submitButtonText="Submit Registration"
            />
          </div>
        )}
      </div>
    </div>
  );
}