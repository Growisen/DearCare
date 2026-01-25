import { Loader } from 'lucide-react';
import React from 'react';
import ModalPortal from '@/components/ui/ModalPortal';

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'red' | 'blue';
  isLoading?: boolean;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonColor = 'red',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const buttonColorClasses = {
    red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    blue: 'bg-blue-700 hover:bg-blue-800 focus:outline-none'
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-1 sm:p-2">
        <div className="bg-white rounded-sm p-6 max-w-sm w-full shadow-xl">
          <h3 className="font-medium text-lg mb-3 text-gray-900">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            {!isLoading && (
              <button
                onClick={onCancel}
                className="px-5 py-1.5 border border-slate-200 rounded-sm text-sm font-medium text-gray-700
                hover:bg-gray-100 focus:outline-none"
              >
                {cancelButtonText}
              </button>
            )}
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-1.5 border border-transparent rounded-sm shadow-none text-sm font-medium text-white
                ${buttonColorClasses[confirmButtonColor]} focus:outline-none
                ${isLoading ? 'opacity-75 cursor-not-allowed w-full' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2 h-4 w-4" />
                  Processing...
                </span>
              ) : (
                confirmButtonText
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ConfirmationModal;