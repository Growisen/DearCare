import React, { useState, useEffect } from 'react';
import ModalPortal from './ModalPortal';

type NotesModalProps = {
  open: boolean;
  initialNotes?: string;
  onSave: (notes: string) => void;
  onClose: () => void;
  title?: string;
  isSaving?: boolean;
};

const NotesModal: React.FC<NotesModalProps> = ({
  open,
  initialNotes = '',
  onSave,
  onClose,
  title = 'Add Notes',
  isSaving = false,
}) => {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes, open]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] transition-opacity">
        <div className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl border border-zinc-200 transition-all">
          <div className="mb-5">
            <h3 className="text-lg font-semibold leading-6 text-zinc-900">
              {title}
            </h3>
          </div>
          
          <textarea
            className="w-full min-h-[140px] resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm
             text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-1
              focus:ring-blue-100 disabled:opacity-50"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Enter notes here..."
            autoFocus
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="flex justify-center items-center text-center rounded-md border border-zinc-300
               bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none
                focus:ring-1 focus:ring-zinc-100 focus:ring-offset-2"
              onClick={isSaving ? undefined : onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex justify-center items-center text-center px-4 py-2 rounded-md border border-blue-200
               bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
              onClick={() => {
                if (!isSaving) {
                  onSave(notes);
                  onClose();
                }
              }}
              disabled={notes.trim() === '' || isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default NotesModal;