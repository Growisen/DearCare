import React, { useState } from 'react';
import ModalPortal from '@/components/ui/ModalPortal';

interface EditCreatedAtModalProps {
  isOpen: boolean;
  currentDate: string;
  onClose: () => void;
  onSave: (newDate: string) => Promise<boolean>;
}

const EditCreatedAtModal: React.FC<EditCreatedAtModalProps> = ({
  isOpen,
  currentDate,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState(currentDate);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    const success = await onSave(date);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center text-gray-800 z-50">
        <div className="bg-white rounded-sm p-6 shadow-lg min-w-[300px]">
          <h2 className="text-lg font-semibold mb-4">Edit Joined Date</h2>
          <input
            type="date"
            value={date.slice(0, 10)}
            onChange={e => setDate(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-4"
            disabled={loading}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-blue-600 text-white flex items-center"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <svg className="animate-spin h-4 w-4 mr-2 inline-block" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditCreatedAtModal;