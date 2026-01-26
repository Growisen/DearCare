import React, { useState } from "react";
import { Plus } from "lucide-react";
import RefundModal, { RefundSubmitData } from "./RefundModal";
import { useRefundsById, addRefund } from "@/hooks/useRefundsById";
import { formatDate } from "@/utils/formatters";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";

const RefundPayments: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApprovingRefundId, setIsApprovingRefundId] = useState<number | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRefundData, setEditRefundData] = useState<RefundSubmitData | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRefundId, setDeletingRefundId] = useState<number | null>(null);

  const { 
		refunds, 
		isLoading, 
		error, 
		invalidateRefunds,
    approveRefund,
    editRefund,
    deleteRefund,
	} = useRefundsById(clientId);

  const onAddClick = () => {
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    onAddClick();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleRefundSubmit = async (data: RefundSubmitData) => {
    setIsProcessing(true);
    const result = await addRefund({
      ...data,
    }, clientId);
    if (result?.success) {
      invalidateRefunds();
      toast.success("Refund added successfully.");
    } else {
      toast.error(result?.error || "Failed to add refund.");
    }
    setIsProcessing(false);
    setIsModalOpen(false);
  };

  const handleApproveRefund = async (id: number) => {
    setIsApprovingRefundId(id);
    const result = await approveRefund({ refundId: id });
    if (result?.success) {
      invalidateRefunds();
      toast.success("Refund approved successfully.");
    } else {
      toast.error(result?.error || "Failed to approve refund.");
    }
    setIsApprovingRefundId(null);
    setApproveModalOpen(false);
    setSelectedRefundId(null);
  };

  const openApproveModal = (id: number) => {
    setSelectedRefundId(id);
    setApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    setApproveModalOpen(false);
    setSelectedRefundId(null);
  };

  const handleEditClick = (refund: RefundSubmitData) => {
    setEditRefundData({
      id: refund.id,
      amount: refund.amount,
      reason: refund.reason || "",
      paymentMethod: refund.paymentMethod,
      paymentType: refund.paymentType,
      refundDate: refund.refundDate || new Date().toISOString().slice(0, 10),
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditRefundData(null);
  };

  const handleEditRefundSubmit = async (data: RefundSubmitData) => {
    setIsProcessing(true);
    if (typeof data.id !== "undefined") {
      const result = await editRefund(data.id, data);
      if (result?.success) {
        invalidateRefunds();
        toast.success("Refund updated successfully.");
      } else {
        toast.error(result?.error || "Failed to update refund.");
      }
    }
    setIsProcessing(false);
    setEditModalOpen(false);
    setEditRefundData(null);
  };

  const openDeleteModal = (id: number) => {
    setDeletingRefundId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingRefundId(null);
  };

  const handleDeleteRefund = async (id: number) => {
    setIsProcessing(true);
    const result = await deleteRefund(id);
    if (result?.success) {
      invalidateRefunds();
      toast.success("Refund deleted successfully.");
    } else {
      toast.error(result?.error || "Failed to delete refund.");
    }
    setIsProcessing(false);
    setDeleteModalOpen(false);
    setDeletingRefundId(null);
  };

  const isRefundsPresent = refunds && refunds.length > 0;

  return (
    <>
      <div className="bg-white rounded border border-slate-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">
            Refund Payment Details ({refunds?.length || 0})
          </h2>
          <button
            onClick={handleAddClick}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2 px-4 rounded-sm
                    transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Refund
          </button>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error loading refunds.</div>
        ) : isRefundsPresent ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Refund Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {refunds.map((refund, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {refund.amount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {refund.reason || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {refund.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {refund.paymentType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {refund.refundDate
                        ? formatDate(refund.refundDate)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {refund.createdAt
                        ? formatDate(refund.createdAt, true)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        refund.paymentStatus === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {refund.paymentStatus === "approved" ? "Approved" : "Pending"}
                      </span>
                      {refund.paymentStatus === "approved" && refund.approvedAt && (
                        <div className="text-[14px] text-gray-500 mt-1">
                          {formatDate(refund.approvedAt, true)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {refund.paymentStatus !== "approved" && (
                          <>
                            <button
                              onClick={() => openApproveModal(refund.id)}
                              className={`w-full px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-sm hover:bg-emerald-100 transition-colors disabled:opacity-50  ${
                                isApprovingRefundId === refund.id ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              disabled={isApprovingRefundId === refund.id}
                            >
                              {isApprovingRefundId === refund.id ? "Approving..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleEditClick(refund)}
                              className="w-full px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-sm hover:bg-blue-100 transition-colors"
                              disabled={isProcessing}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal(refund.id)}
                              className="w-full px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-sm hover:bg-red-100 transition-colors"
                              disabled={isProcessing}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {refund.paymentStatus === "approved" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                            Approved
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
             <p>No refund records found.</p>
             <p className="text-xs text-gray-400 mt-1">Click the button above to add a new refund.</p>
          </div>
        )}
      </div>
      <RefundModal
        isOpen={isModalOpen}
        isProcessing={isProcessing}
        onClose={handleModalClose}
        onSubmit={handleRefundSubmit}
      />
      <RefundModal
        isOpen={editModalOpen}
        isProcessing={isProcessing}
        onClose={handleEditModalClose}
        onSubmit={handleEditRefundSubmit}
        initialData={editRefundData}
      />
      <Modal
        open={approveModalOpen}
        onClose={closeApproveModal}
        onConfirm={() => selectedRefundId && handleApproveRefund(selectedRefundId)}
        variant="approve"
        title="Approve Refund"
        description="Are you sure you want to approve this refund? This action cannot be undone."
        confirmText={isApprovingRefundId ? "Approving..." : "Approve"}
        cancelText="Cancel"
      />
      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => deletingRefundId && handleDeleteRefund(deletingRefundId)}
        variant="delete"
        title="Delete Refund"
        description="Are you sure you want to delete this refund? This action cannot be undone."
        confirmText={isProcessing ? "Deleting..." : "Delete"}
        cancelText="Cancel"
      />
    </>
  );
};

export default RefundPayments;