import React, { useState, useEffect } from 'react';
import ModalPortal from './ModalPortal';
import { Loader2 } from 'lucide-react';

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
        <div className="w-full max-w-md transform overflow-hidden rounded-sm bg-white p-6 text-left align-middle border border-slate-200 transition-all">
          <div className="mb-5">
            <h3 className="text-lg font-semibold leading-6 text-zinc-900">
              {title}
            </h3>
          </div>
          
          <textarea
            className="w-full min-h-[140px] resize-none rounded-sm border border-slate-200 px-3 py-2 text-sm
             text-zinc-900 placeholder:text-zinc-400 focus:border-slate-300 focus:outline-none
              disabled:opacity-50"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Enter notes here..."
            autoFocus
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="flex justify-center items-center text-center rounded-sm border border-slate-200
               bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none
               focus:border-slate-300"
              onClick={isSaving ? undefined : onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex justify-center items-center text-center px-4 py-1.5 rounded-sm border border-slate-200
               bg-blue-700 text-white hover:bg-blue-800 transition"
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
                  <Loader2 className="animate-spin h-4 w-4 text-white" />
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