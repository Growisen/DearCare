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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-gray-200">

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Client Registration
            </h1>
            <p className="text-gray-500 mt-1">
              Create a new client profile and for getting care requirements.
            </p>
          </div>
          <div className="flex items-center gap-3 opacity-90">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-100">
              <div className="relative w-20 h-10">
                <Image
                  src="/DearCare.png"
                  alt="DearCare Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg leading-none tracking-tight">
                <span className='text-dCblue'>Dear</span><span className='text-amber-500'>C</span><span className='text-dCblue'>are</span>
              </span>
            </div>
          </div>
        </div>
        {isSuccess ? (
          <div className="max-w-2xl mx-auto mt-12">
            <SuccessMessage />
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-md">
            <div className="p-6 sm:p-10">
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
                submitButtonText="Register Client"
              />
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-md flex justify-between items-center text-xs text-gray-500">
                <p>Fields marked with <span className="text-red-500">*</span> are mandatory.</p>
                <p>Need help? Call <span className="font-medium text-gray-900">+91 9645400035</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}