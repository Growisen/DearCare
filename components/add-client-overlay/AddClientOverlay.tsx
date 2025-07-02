import React from 'react';
import { X } from 'lucide-react';
import { AddClientProps } from '@/types/client.types';
import { useClientForm } from '@/hooks/useAddClient';
import { ClientFormComponent } from '@/components/client/AddClientForm';

export function AddClientOverlay({ onClose, onAdd }: AddClientProps) {
  const { 
    formData, 
    formErrors, 
    clientType, 
    isSubmitting, 
    isSameAddress,
    handleInputChange,
    handleBlur,
    handleProfileImageChange,
    handleStaffRequirementsChange,
    handleClientTypeChange,
    handleClientCategoryChange,
    handleSameAddressToggle,
    handleSubmit
  } = useClientForm({
    onSuccess: onAdd || onClose
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-300">
      <div className="bg-white w-full md:w-11/12 lg:w-4/5 xl:max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
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
          handleClientCategoryChange={handleClientCategoryChange}
          handleSameAddressToggle={handleSameAddressToggle}
          handleSubmit={handleSubmit}
          showCategories={true}
          submitButtonText="Add Client"
          isInOverlay={true}
        />
      </div>
    </div>
  );
}