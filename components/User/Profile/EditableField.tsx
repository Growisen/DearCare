import { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

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
      <label className="text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      
      {!isEditing ? (
        <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="text-gray-700">
            {value || <span className="text-gray-400 italic">{placeholder}</span>}
          </div>
          {!isDisabled && (
            <button 
              onClick={handleEdit}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              disabled={isDisabled}
              aria-label={`Edit ${label}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-3 border border-gray-200 p-3 rounded bg-gray-50">
          <input
            type={fieldType}
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            className="border border-gray-300 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800"
            disabled={isSaving}
            autoFocus
          />
          <div className="flex space-x-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 text-gray-800 flex items-center gap-1.5 transition-colors"
              disabled={isSaving}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-800 disabled:bg-gray-400 flex items-center gap-1.5 transition-colors"
              disabled={isSaving || fieldValue === value || fieldValue === ''}
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}