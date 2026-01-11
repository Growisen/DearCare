import React, { useRef, useState, useCallback, useEffect } from 'react';
import PatientAssessment from '@/components/client/PatientAssessment';

interface EditPatientModalProps {
  isEditing: boolean;
  clientId: string;
  handleSave: () => void;
  handleCancel: () => void;
  selectedAssessment?: string;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isEditing,
  clientId,
  handleSave,
  handleCancel,
  selectedAssessment
}) => {
  const formRef = useRef<HTMLFormElement>(null) as React.RefObject<HTMLFormElement>;
  const [isSaving, setIsSaving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      setIsSaving(false);
      setIsCanceling(false);
      setError(null);
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isEditing]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        handleCancelWithState();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaving]);
  
  const triggerSave = useCallback(() => {
    if (formRef.current) {
      setIsSaving(true);
      setError(null);
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }, []);
  
  const handleCancelWithState = useCallback(() => {
    if (isSaving) return;
    setIsCanceling(true);
    handleCancel();
  }, [handleCancel, isSaving]);
  
  const handleSaveWithState = useCallback(() => {
    setIsSaving(false);
    handleSave();
  }, [handleSave]);
  
  const handleOutsideClick = useCallback((e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isSaving) {
      handleCancelWithState();
    }
  }, [handleCancelWithState, isSaving]);
  
  if (!isEditing) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-sm shadow-xl p-6 w-full max-w-5xl max-h-[85vh] relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Patient Details</h2>
          <button
            onClick={handleCancelWithState}
            disabled={isSaving}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-grow pb-24 pr-2">
          <PatientAssessment 
            clientId={clientId} 
            isEditing={true}
            onSave={handleSaveWithState}
            showSaveButton={false}
            formRef={formRef}
            selectedAssessment={selectedAssessment}
          />
        </div>
        
        {error && (
          <div className="absolute bottom-16 left-0 right-0 px-4">
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm">
              {error}
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shadow-md">
          <button 
            onClick={handleCancelWithState}
            disabled={isCanceling || isSaving}
            className={`px-4 py-2 text-gray-600 border border-slate-200 rounded-sm hover:bg-gray-50 transition-colors duration-200 text-sm font-medium ${(isCanceling || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCanceling ? 'Canceling...' : 'Cancel'}
          </button>
          <button 
            onClick={triggerSave}
            disabled={isSaving || isCanceling}
            className={`px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors duration-200 text-sm font-medium ${(isSaving || isCanceling) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPatientModal;