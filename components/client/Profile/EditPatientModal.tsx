import React, { useRef, useState } from 'react';
import PatientAssessment from '@/components/client/PatientAssessment';

interface EditPatientModalProps {
  isEditing: boolean;
  clientId: string;
  handleSave: () => void;
  handleCancel: () => void;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isEditing,
  clientId,
  handleSave,
  handleCancel
}) => {
  // Create a ref for the form with type assertion
  const formRef = useRef<HTMLFormElement>(null) as React.RefObject<HTMLFormElement>;
  const [isSaving, setIsSaving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  
  const triggerSave = () => {
    if (formRef.current) {
      setIsSaving(true);
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };
  
  const handleCancelWithState = () => {
    setIsCanceling(true);
    handleCancel();
  };
  
  const handleSaveWithState = () => {
    setIsSaving(false);
    handleSave();
  };
  
  if (!isEditing) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-5xl max-h-[90vh] relative flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Patient Details</h2>
        </div>
        
        {/* Scrollable content area with padding at bottom to prevent button overlap */}
        <div className="overflow-y-auto flex-grow pb-20">
          <PatientAssessment 
            clientId={clientId} 
            isEditing={true}
            onSave={handleSaveWithState}
            showSaveButton={false}
            formRef={formRef}
          />
        </div>
        
        {/* Fixed buttons at bottom of modal */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shadow-md">
          <button 
            onClick={handleCancelWithState}
            disabled={isCanceling || isSaving}
            className={`px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium ${(isCanceling || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCanceling ? 'Canceling...' : 'Cancel'}
          </button>
          <button 
            onClick={triggerSave}
            disabled={isSaving || isCanceling}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium ${(isSaving || isCanceling) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPatientModal;