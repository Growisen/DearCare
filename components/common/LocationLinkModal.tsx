import React, { useState } from 'react';

interface LocationLinkModalProps {
  isOpen: boolean;
  initialLink?: string;
  onClose: () => void;
  onSave: (link: string) => void;
  title?: string;
}

const LocationLinkModal: React.FC<LocationLinkModalProps> = ({
  isOpen,
  initialLink = '',
  onClose,
  onSave,
  title = 'Edit Location Link',
}) => {
  const [link, setLink] = useState(initialLink);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 text-gray-800">
      <div className="bg-white rounded-sm shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <input
          type="text"
          className="w-full rounded px-3 py-2 mb-4 focus:outline-none border border-slate-200"
          placeholder="Paste Google Maps link here"
          value={link}
          onChange={e => setLink(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onSave(link)}
            disabled={!link}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationLinkModal;