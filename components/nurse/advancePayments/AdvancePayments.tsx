import React, { useState, useEffect } from "react";
import Table, { TableColumn } from "../../common/Table";
import { IoAdd, IoTrash, IoDocumentTextOutline, IoEyeOutline } from 'react-icons/io5';
import CreateAdvancePaymentModal from "./CreateAdvancePaymentModal";
import { fetchAdvancePayments, deleteAdvancePayment } from "@/app/actions/staff-management/advance-payments";
import Modal from "../../ui/Modal";
import AddInstallmentModal from "./AddInstallmentModal";
import { formatDate } from "@/utils/formatters";
import { toast } from 'sonner';
import TransactionHistoryModal from "./TransactionHistoryModal";

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
  actions?: React.ReactNode;
  payment_method?: string;
  receipt_url?: string | null;
  info?: string | null;
};

export default function AdvancePayments({ nurseId }: { nurseId: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState<AdvancePayment[]>([]);
  const [loading, setLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdvancePayment | null>(null);

  const [addInstallmentModalOpen, setAddInstallmentModalOpen] = useState(false);
  const [installmentPayment, setInstallmentPayment] = useState<AdvancePayment | null>(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistoryPayment, setSelectedHistoryPayment] = useState<AdvancePayment | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await fetchAdvancePayments(nurseId);
      setPayments(data || []);
    } catch {
      setPayments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, [nurseId]);

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
    } catch (err: unknown) {
      const errorMessage = typeof err === "object" && err !== null && "message" in err
        ? (err as { message?: string }).message
        : "Failed to delete payment.";
      toast.error(
        errorMessage || "Failed to delete payment.",
        {
          action: {
            label: "OK",
            onClick: () => toast.dismiss(),
          },
        }
      );
      setDeleteModalOpen(false);
      setSelectedPayment(null);
    }
    setLoading(false);
  };

  const handleAddInstallment = async(payment: AdvancePayment) => {
    setInstallmentPayment(payment);
    setAddInstallmentModalOpen(true);
  };

  const columns: TableColumn<AdvancePayment>[] = [
    { 
      key: "date", 
      header: "Date", 
      render: (v) => formatDate(v as string) 
    },
    { 
      key: "advance_amount", 
      header: "Advance Payment", 
      align: "left", 
      render: (_v, row) => (
        <div>
          <div className="font-medium">₹{row.advance_amount}</div>
          {row.payment_method && (
            <div className="text-xs text-gray-500">Method: {row.payment_method}</div>
          )}
          {row.receipt_url && (
            <a 
              href={row.receipt_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 underline text-xs flex items-center gap-1 mt-0.5"
            >
              <IoDocumentTextOutline /> Receipt
            </a>
          )}
        </div>
      )
    },
    { key: "return_amount", header: "Return Amount", align: "left", render: (v) => v ? `₹${v}` : "-" },
    { key: "return_type", header: "Return Type" },
    { key: "installment_amount", header: "Installment Amount", align: "left", render: (v) => v ? `₹${v}` : "-" },
    { 
      key: "remaining_amount", 
      header: "Remaining",  
    },
    {
      key: "deductions",
      header: "Transactions",
      align: "center",
      render: (_v, row) => {
        const count = row.deductions?.length || 0;
        return (
            <button 
                onClick={() => handleViewHistory(row)}
                className={`
                    flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${count > 0 
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-200'
                    }
                `}
            >
                <IoEyeOutline size={14} />
                {count > 0 ? `View (${count})` : 'View'}
            </button>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (_v, row,) => (
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            className="text-green-600 hover:text-green-800 px-2 py-1 transition-colors"
            onClick={() => handleAddInstallment(row)}
            title="Add Installment"
          >
            <IoAdd size={18} />
          </button>
          <button
            type="button"
            className="text-red-600 hover:text-red-800 px-2 py-1 transition-colors"
            onClick={() => handleDelete(row)}
            title="Delete"
          >
            <IoTrash size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 p-2">
        <h2 className="text-lg font-semibold text-gray-800">Advance Payments</h2>
        <button
          type="button"
          className="px-5 py-2 bg-white/30 text-gray-800 border border-gray-200 
            rounded-sm font-medium tracking-wide flex items-center gap-2 hover:bg-gray-50 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <IoAdd size={20} />
          Add
        </button>
      </div>
      
      <Table
        columns={columns}
        data={payments}
        rowKey={(row) => row.id}
        loading={loading}
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
        description={
          installmentPayment
            ? `Date: ${installmentPayment.date}\nAdvance Amount: ₹${installmentPayment.advance_amount}\nRemaining: ₹${installmentPayment.remaining_amount}`
            : undefined
        }
      />

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        variant="delete"
        title="Are you sure you want to delete this payment?"
        description={`Date: ${selectedPayment?.date}\nAmount: ₹${selectedPayment?.advance_amount}`}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />

      <TransactionHistoryModal 
        isOpen={historyModalOpen}
        onClose={() => {
            setHistoryModalOpen(false);
            setSelectedHistoryPayment(null);
        }}
        payment={selectedHistoryPayment}
      />
    </div>
  );
}