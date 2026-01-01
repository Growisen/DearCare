import React from 'react';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const FormActions = ({ onCancel, onSubmit, isSubmitting }: FormActionsProps) => {
  return (
    <div className="flex gap-3 pt-3">
      <button 
        onClick={onCancel} 
        className="px-5 py-2 text-sm text-gray-700 bg-gray-50 border border-slate-200 rounded-sm hover:bg-gray-100 transition duration-200"
      >
        Cancel
      </button>
      <button 
        onClick={onSubmit} 
        disabled={isSubmitting}
        className="flex-1 px-5 py-2 text-sm bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition duration-200 font-medium"
      >
        {isSubmitting ? 'Adding Client...' : 'Add Client'}
      </button>
    </div>
  );
};