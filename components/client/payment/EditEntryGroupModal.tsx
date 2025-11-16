import React, { useState, useEffect } from "react";
import { EntryGroup } from "@/types/paymentDetails.types";
import ModalPortal from "@/components/ui/ModalPortal";
import { updateClientPaymentGroup } from "@/app/actions/clients/client-payment-records";
import { toast } from "sonner";

interface ExtendedEntryGroup extends EntryGroup {
  startDate?: string;
  endDate?: string;
  showToClient: boolean;
}

interface EditEntryGroupModalProps {
  group: ExtendedEntryGroup;
  onClose: () => void;
  onSave: (updatedGroup: ExtendedEntryGroup) => void;
}

const EditEntryGroupModal: React.FC<EditEntryGroupModalProps> = ({
  group,
  onClose,
  onSave,
}) => {
  const [groupName, setGroupName] = useState(group.groupName);
  const [notes, setNotes] = useState(group.notes || "");
  
  const [showToClient, setShowToClient] = useState(group.showToClient ?? true);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(formatDateForInput(group.startDate));
  const [endDate, setEndDate] = useState(formatDateForInput(group.endDate));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    const result = await updateClientPaymentGroup({
      paymentRecordId: group.id,
      groupName,
      notes,
      showToClient,
      startDate,
      endDate,
    });

    if (result.success) {
      onSave({
        ...group,
        groupName,
        notes,
        startDate,
        endDate,
        showToClient,
      });
      onClose();
    } else {
      toast.error(result.error || "Failed to update payment group.");
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Edit Entry Group</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100
                focus:outline-none focus:ring-1 focus:ring-slate-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 
                placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-gray-400
                  transition-shadow sm:text-sm shadow-sm"
                placeholder="e.g. Monthly Subscriptions"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none 
                  focus:ring-1 focus:ring-gray-400 sm:text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none
                   focus:ring-1 focus:ring-gray-400 sm:text-sm shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Who can see this?
              </label>
              <div className="relative">
                <select
                  value={showToClient ? 'yes' : 'no'}
                  onChange={(e) => setShowToClient(e.target.value === 'yes')}
                  className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 
                  bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm shadow-sm cursor-pointer"
                >
                  <option value="yes">Visible to Client</option>
                  <option value="no">Hidden (Internal Only)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 placeholder:text-slate-400 
                focus:outline-none focus:ring-1 focus:ring-gray-400 transition-shadow sm:text-sm shadow-sm resize-none"
                placeholder="Add any additional details here..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg
                hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm
                hover:shadow focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditEntryGroupModal;