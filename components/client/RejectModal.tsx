interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: () => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  isSubmitting: boolean;
}

const RejectModal = ({ 
  isOpen, 
  onClose, 
  onReject, 
  rejectionReason, 
  setRejectionReason, 
  isSubmitting 
}: RejectModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Confirm Rejection</h3>
        <p className="mb-4 text-gray-600">Please provide a reason for rejecting this client:</p>
        
        <textarea
          className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Enter rejection reason..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={4}
          required
        />
        
        <div className="flex justify-end gap-3 mt-4">
          <button 
            className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400"
            onClick={onReject}
            disabled={isSubmitting || !rejectionReason.trim()}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal