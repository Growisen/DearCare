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
    handleSubmit,
    homeMaidFormData,
    homeMaidFormErrors,
    handleHomeMaidInputChange,
    handleHomeMaidDutyChange,
    deliveryCareFormData,
    deliveryCareFormErrors,
    handleDeliveryCareInputChange,
    handleDeliveryCareDutyChange,

    childCareFormData,
    setChildCareFormData,
    handleChildCareInputChange,
    handleChildCareCheckboxChange,
  } = useClientForm({
    onSuccess: onAdd || onClose,
  });

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white w-full md:w-11/12 lg:w-4/5 xl:max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 rounded-sm flex flex-col">

        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between z-10 rounded-t-sm">
          <h2 className="text-lg font-semibold text-gray-800">Add New Client</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-sm transition-colors duration-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-0">
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
            homeMaidFormData={homeMaidFormData}
            homeMaidFormErrors={homeMaidFormErrors}
            handleHomeMaidInputChange={handleHomeMaidInputChange}
            handleHomeMaidDutyChange={handleHomeMaidDutyChange}
            deliveryCareFormData={deliveryCareFormData}
            deliveryCareFormErrors={deliveryCareFormErrors}
            handleDeliveryCareInputChange={handleDeliveryCareInputChange}
            handleDeliveryCareDutyChange={handleDeliveryCareDutyChange}
            childCareFormData={childCareFormData}
            setChildCareFormData={setChildCareFormData}
            handleChildCareInputChange={handleChildCareInputChange}
            handleChildCareCheckboxChange={handleChildCareCheckboxChange}
          />
        </div>
      </div>
    </div>
  );
}