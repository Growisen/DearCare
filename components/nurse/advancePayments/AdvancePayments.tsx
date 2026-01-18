import React, { useState, useEffect, useCallback } from "react";
import { IoAdd } from 'react-icons/io5';
import CreateAdvancePaymentModal from "./CreateAdvancePaymentModal";
import { 
  fetchAdvancePayments, 
  deleteAdvancePayment, 
  approveAdvancePayment, 
  deleteDeductionFromPayment 
} from "@/app/actions/staff-management/advance-payments";
import Modal from "../../ui/Modal";
import AddInstallmentModal from "./AddInstallmentModal";
import { toast } from 'sonner';
import TransactionHistoryModal from "./TransactionHistoryModal";
import { getNurseTenantName } from "@/utils/formatters";
import AdvancePaymentsTable from "./AdvancePaymentsTable";

type Deduction = {
  date: string;
  amount_paid?: number;
  lend?: number;
  remaining: number;
  type?: string;
  payment_method?: string;
  receipt_file?: string | null;
  info?: string | null;
};

type AdvancePayment = {
  id: string;
  date: string;
  advance_amount: number;
  status?: string;
  return_type: string;
  return_amount?: number;
  installment_amount?: number;
  remaining_amount: number;
  deductions?: Deduction[];
  payment_method?: string;
  receipt_url?: string | null;
  info?: string | null;
  approved: boolean;
};

export default function AdvancePayments({ nurseId, tenant }: { nurseId: number, tenant: string }) {
  const nurseTenantName = getNurseTenantName(tenant);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState<AdvancePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdvancePayment | null>(null);
  const [addInstallmentModalOpen, setAddInstallmentModalOpen] = useState(false);
  const [installmentPayment, setInstallmentPayment] = useState<AdvancePayment | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryPayment, setSelectedHistoryPayment] = useState<AdvancePayment | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalPayment, setApprovalPayment] = useState<AdvancePayment | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdvancePayments(nurseId);
      setPayments(data || []);
    } catch {
      setPayments([]);
    }
    setLoading(false);
  }, [nurseId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);
  
  const handleDelete = (payment: AdvancePayment) => {
    setSelectedPayment(payment);
    setDeleteModalOpen(true);
  };

  const handleViewHistory = (payment: AdvancePayment) => {
    setSelectedHistoryPayment(payment);
    setHistoryModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPayment) return;
    setLoading(true);
    try {
      await deleteAdvancePayment(selectedPayment.id);
      setDeleteModalOpen(false);
      setSelectedPayment(null);
      await loadPayments();
      toast.success("Payment deleted successfully.");
    } catch (err: unknown) {
      const errorMessage = typeof err === "object" && err !== null && "message" in err
        ? (err as { message?: string }).message
        : "Failed to delete payment.";
      toast.error(errorMessage);
      setDeleteModalOpen(false);
      setSelectedPayment(null);
    }
    setLoading(false);
  };

  const handleAddInstallment = async(payment: AdvancePayment) => {
    setInstallmentPayment(payment);
    setAddInstallmentModalOpen(true);
  };

  const handleSendAdvanceAmount = async (payment: AdvancePayment) => {
    setApprovalPayment(payment);
    setApprovalModalOpen(true);
  };

  const confirmApproval = async () => {
    if (!approvalPayment) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DAYBOOK_API_URL}/daybook/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nurse_id: String(nurseId),
          amount: approvalPayment.advance_amount,
          description: approvalPayment.info,
          tenant: nurseTenantName,
          payment_type: "outgoing",
          pay_status: "paid",
        }),
      });

      const result = await response.json();

      if (!result.error) {
        if (!approvalPayment.approved) {
          await approveAdvancePayment(approvalPayment.id);
        }
        toast.success("Advance amount sent and payment approved!");
        await loadPayments();
      } else {
        toast.error("Failed to send: " + (result.error || response.statusText));
      }
    } catch (error) {
      console.error("Send advance error:", error);
      toast.error("Error sending advance amount.");
    } finally {
      setApprovalModalOpen(false);
      setApprovalPayment(null);
      setLoading(false);
    }
  };

  const handleDeleteDeduction = async (item: Deduction) => {
    if (!selectedHistoryPayment) return;
    try {
      const res = await deleteDeductionFromPayment({
        payment_id: selectedHistoryPayment.id,
        deduction: item,
      });
      if (res.success && res.data) {
        toast.success("Deduction deleted successfully.");
        const updatedPayment = {
          ...selectedHistoryPayment,
          advance_amount: res.data.advance_amount,
          deductions: res.data.deductions,
          remaining_amount: res.data.remaining_amount ?? selectedHistoryPayment.remaining_amount,
          return_amount: res.data.return_amount ?? selectedHistoryPayment.return_amount,
        };
        setSelectedHistoryPayment(updatedPayment);
        setPayments((prev) =>
          prev.map((p) => p.id === selectedHistoryPayment.id ? updatedPayment : p)
        );
      } else {
        throw new Error("Failed to delete deduction.");
      }
    } catch (err: unknown) {
        const errorMessage = typeof err === "object" && err !== null && "message" in err
        ? (err as { message?: string }).message
        : "Failed to delete deduction.";
      toast.error(errorMessage);
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
        payments={payments}
        loading={loading}
        onViewHistory={handleViewHistory}
        onAddInstallment={handleAddInstallment}
        onSendAdvanceAmount={handleSendAdvanceAmount}
        onDelete={handleDelete}
      />
      <CreateAdvancePaymentModal
        isOpen={isModalOpen}
        nurseId={nurseId}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => loadPayments()}
      />
      <AddInstallmentModal
        open={addInstallmentModalOpen}
        paymentId={installmentPayment ? installmentPayment.id : ""}
        onClose={() => {
          setAddInstallmentModalOpen(false);
          setInstallmentPayment(null);
        }}
        onConfirm={async () => {
          await loadPayments();
          setAddInstallmentModalOpen(false);
          setInstallmentPayment(null);
        }}
      />
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        variant="delete"
        title="Delete this record?"
        description={`Date: ${selectedPayment?.date}\nAmount: ₹${selectedPayment?.advance_amount}`}
        confirmText="Yes, delete"
        cancelText="Cancel"
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
        description={`Date: ${approvalPayment?.date}\nAmount: ₹${approvalPayment?.advance_amount}`}
        confirmText="Yes, approve"
        cancelText="Cancel"
      />
      <TransactionHistoryModal 
        isOpen={historyModalOpen}
        onClose={() => {
            setHistoryModalOpen(false);
            setSelectedHistoryPayment(null);
        }}
        payment={selectedHistoryPayment}
        onDeleteItem={handleDeleteDeduction}
      />
    </div>
  );
}