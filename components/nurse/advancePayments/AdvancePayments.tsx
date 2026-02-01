import React, { useState } from "react";
import { IoAdd } from 'react-icons/io5';
import CreateAdvancePaymentModal from "./CreateAdvancePaymentModal";
import Modal from "../../ui/Modal";
import { toast } from 'sonner';
import { getNurseTenantName } from "@/utils/formatters";
import AdvancePaymentsTable from "./AdvancePaymentsTable";
import { useAdvancePaymentsById, AdvancePayment } from "@/hooks/useAdvancePaymentsById";

export default function AdvancePayments({ nurseId, tenant }: { nurseId: number, tenant: string }) {
  const nurseTenantName = getNurseTenantName(tenant);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdvancePayment | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalPayment, setApprovalPayment] = useState<AdvancePayment | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const {
    advancePayments: payments,
    isLoading: loading,
    deleteAdvancePayment,
    approveAdvancePaymentAndSend,
  } = useAdvancePaymentsById(nurseId);

  const handleDelete = (payment: AdvancePayment) => {
    setSelectedPayment(payment);
    setDeleteModalOpen(true);
  };

  const handleSendAdvanceAmount = async (payment: AdvancePayment) => {
    setApprovalPayment(payment);
    setApprovalModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPayment) return;
    setDeleteLoading(true);
    const result = await deleteAdvancePayment(selectedPayment.id);
    setDeleteLoading(false);
    setDeleteModalOpen(false);
    setSelectedPayment(null);
    if (result?.success) {
      toast.success(result?.message || "Payment deleted successfully.");
    } else {
      toast.error(result?.message || "Failed to delete payment.");
    }
  };

  const confirmApproval = async () => {
    if (!approvalPayment) return;
    setApprovalLoading(true);
    const result = await approveAdvancePaymentAndSend({
      payment: approvalPayment,
      nurseTenantName,
      nurseId,
    });
    setApprovalLoading(false);
    setApprovalModalOpen(false);
    setApprovalPayment(null);
    if (result?.success) {
      toast.success(result?.message || "Advance amount sent and payment approved!");
    } else {
      toast.error(result?.message || "Failed to send: " + (result?.error || ""));
    }
  };

  return (
    <div className="w-full min-h-[400px] bg-white border border-slate-200 rounded-sm p-4">
      <div className="border border-slate-200 flex items-center justify-between p-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Staff Advances</h3>
          <p className="text-sm text-slate-500 mt-1">
            Track advances, repayments, and history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 
          rounded-sm transition-colors flex items-center gap-2"
        >
          <IoAdd size={18} />
          New Advance
        </button>
      </div>
      <AdvancePaymentsTable
        payments={payments ?? []}
        loading={loading}
        onApprove={handleSendAdvanceAmount}
        onDelete={handleDelete}
      />
      <CreateAdvancePaymentModal
        isOpen={isModalOpen}
        nurseId={nurseId}
        onClose={() => setIsModalOpen(false)}
      />
      
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedPayment(null);
          setDeleteLoading(false);
        }}
        onConfirm={confirmDelete}
        variant="delete"
        title="Delete this record?"
        description={`Date: ${selectedPayment?.date}\nAmount: ₹${selectedPayment?.amount}`}
        confirmText={deleteLoading ? "Deleting..." : "Yes, delete"}
        cancelText="Cancel"
        loading={deleteLoading}
      />
      <Modal
        open={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setApprovalPayment(null);
        }}
        onConfirm={confirmApproval}
        variant="approve"
        title="Approve this payment?"
        description={`Date: ${approvalPayment?.date}\nAmount: ₹${approvalPayment?.amount}`}
        confirmText={approvalLoading ? "Approving..." : "Yes, approve"}
        cancelText="Cancel"
        loading={approvalLoading}
      />
    </div>
  );
}