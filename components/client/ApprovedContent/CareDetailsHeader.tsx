import React from 'react';

interface CareDetailsHeaderProps {
  isEditing: boolean;
  onAssignNurse: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEndCare: () => void;
}

const CareDetailsHeader: React.FC<CareDetailsHeaderProps> = ({
  isEditing,
  onAssignNurse,
  onEdit,
  onSave,
  onCancel,
  onEndCare
}) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-base font-semibold text-gray-800">Care Details</h3>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <button 
              onClick={onSave}
              className="px-4 py-2 text-white bg-green-600 rounded-sm hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              Save Changes
            </button>
            <button 
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-slate-200 rounded-sm hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={onAssignNurse}
              className="px-4 py-2 text-white bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Assign Nurse
            </button>
            <button 
              onClick={onEdit}
              className="px-4 py-2 text-blue-600 border border-blue-200 rounded-sm hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
            >
              Edit Details
            </button>
            <button 
              onClick={onEndCare}
              className="px-4 py-2 text-red-600 border border-red-200 rounded-sm hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
            >
              End Care
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CareDetailsHeader;