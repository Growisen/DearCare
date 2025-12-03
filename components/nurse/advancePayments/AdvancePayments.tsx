import React, { useState, useEffect } from "react";
import Table, { TableColumn } from "../../common/Table";
import { IoAdd, IoTrash, IoDocumentTextOutline, IoTimeOutline } from 'react-icons/io5';
import CreateAdvancePaymentModal from "./CreateAdvancePaymentModal";
import { fetchAdvancePayments, deleteAdvancePayment, approveAdvancePayment } from "@/app/actions/staff-management/advance-payments";
import Modal from "../../ui/Modal";
import AddInstallmentModal from "./AddInstallmentModal";
import { formatDate } from "@/utils/formatters";
import { toast } from 'sonner';
import TransactionHistoryModal from "./TransactionHistoryModal";
import { getNurseTenantName } from "@/utils/formatters";

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

  const handleSendAdvanceAmount = async (payment: AdvancePayment) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DAYBOOK_API_URL}/daybook/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nurse_id: String(nurseId),
          amount: payment.advance_amount,
          description: payment.info,
          tenant: nurseTenantName,
          payment_type: "outgoing",
          pay_status: "paid",
        }),
      });

      const result = await response.json();

      if (!result.error) {
        if (!payment.approved) {
          await approveAdvancePayment(payment.id);
        }
        toast.success("Advance amount sent and payment approved!", {
          action: {
            label: "OK",
            onClick: () => toast.dismiss(),
          },
        });
        await loadPayments();
      } else {
        toast.error("Failed to send: " + (result.error || response.statusText));
      }
    } catch (error) {
      console.error("Send advance error:", error);
      toast.error("Error sending advance amount.");
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<AdvancePayment>[] = [
    { 
      key: "date", 
      header: "Issue Date", 
      render: (v) => formatDate(v as string) 
    },
        { 
      key: "advance_amount", 
      header: "Total Advance", 
      align: "left", 
      render: (_v, row) => (
        <div>
          <div className="font-medium">₹{row.advance_amount}</div>
          {row.payment_method && (
            <div className="text-xs text-gray-500">{row.payment_method}</div>
          )}
          {row.receipt_url ? (
            <a 
              href={row.receipt_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 underline text-xs flex items-center gap-1 mt-0.5"
            >
              <IoDocumentTextOutline /> Receipt
            </a>
          ) : (
            <div className="text-xs text-gray-400 mt-0.5">No receipt</div>
          )}
        </div>
      )
    },
    {
      key: "info",
      header: "Notes",
      align: "left",
      render: (v) => (
        <div style={{ maxWidth: 180, whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
          {v ? String(v) : "-"}
        </div>
      ),
    },
    { key: "return_amount", header: "Total Repaid", align: "left", render: (v) => v ? `₹${v}` : "-" },
    { key: "return_type", header: "Plan" },
    { key: "installment_amount", header: "Installment", align: "left", render: (v) => v ? `₹${v}` : "-" },
    { 
      key: "remaining_amount", 
      header: "Balance Due",  
    },
    {
      key: "deductions",
      header: "History",
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
                <IoTimeOutline size={14} />
                {count > 0 ? `View (${count})` : 'Empty'}
            </button>
        );
      }
    },
    {
      key: "actions",
      header: "",
      align: "center",
      render: (_v, row) => (
        <div className="flex flex-col gap-2 items-center justify-center">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 border border-green-300 rounded-md
             bg-green-50 text-green-700 text-xs font-medium shadow-sm hover:bg-green-100
              hover:text-green-800 transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
            onClick={() => handleAddInstallment(row)}
            title="Repayment"
          >
            <IoAdd size={18} />
            Repayment
          </button>
          {row.approved ? (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs 
            font-semibold border border-green-200">
              Approved
            </span>
          ) : (
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 px-2 py-1 transition-colors 
              flex items-center gap-1"
              onClick={() => handleSendAdvanceAmount(row)}
              disabled={loading}
              title="Approve"
            >
              {loading ? (
                <span className="animate-spin mr-1 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></span>
              ) : null}
              Approve
            </button>
          )}
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
        <h2 className="text-lg font-semibold text-gray-800">Staff Advances</h2>
        <button
          type="button"
          className="px-5 py-2 bg-white/30 text-gray-800 border border-gray-200 
            rounded-sm font-medium tracking-wide flex items-center gap-2 hover:bg-gray-50 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <IoAdd size={20} />
          New Advance
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