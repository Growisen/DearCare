import { useState } from 'react';

interface EditableFieldProps {
  label: string;
  value: string | null;
  onSave: (newValue: string) => Promise<void>;
  isDisabled?: boolean;
  placeholder?: string;
  fieldType?: 'text' | 'email' | 'tel';
}

export default function EditableField({ 
  label, 
  value, 
  onSave, 
  isDisabled = false,
  placeholder = 'Not provided',
  fieldType = 'text' 
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setFieldValue(value || '');
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    if (fieldValue === value || fieldValue === '') return;
    
    setIsSaving(true);
    try {
      await onSave(fieldValue);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      
      {!isEditing ? (
        <div className="flex justify-between items-center text-gray-800 p-2 bg-gray-50 rounded border border-gray-200">
          <div>
            {value || <span className="text-gray-400">{placeholder}</span>}
          </div>
          {!isDisabled && (
            <button 
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              disabled={isDisabled}
            >
              Edit
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <input
            type={fieldType}
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            className="border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800"
            disabled={isSaving}
            autoFocus
          />
          <div className="flex space-x-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-800"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSaving || fieldValue === value || fieldValue === ''}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}