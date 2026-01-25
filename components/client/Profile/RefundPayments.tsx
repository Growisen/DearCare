import React, { useState } from "react";
import { Plus } from "lucide-react";
import CreateRefundModal, { RefundSubmitData } from "./CreateRefundModal";
import { useRefundsById, addRefund } from "@/hooks/useRefundsById";
import { formatDate } from "@/utils/formatters";

export interface RefundInput {
  client_id: number;
  amount: number;
  reason?: string;
  paymentMethod: string;
  paymentType: string;
	createdAt?: string;
}

interface RefundDetailsProps {
  clientId: string;
}

const RefundPayments: React.FC<RefundDetailsProps> = ({ clientId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { 
		refunds, 
		isLoading, 
		error, 
		invalidateRefunds 
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
    try {
      await addRefund({
        ...data,
      }, clientId);
      invalidateRefunds();
    } catch (err) {
      console.error(err);
    }
    setIsProcessing(false);
    setIsModalOpen(false);
  };

  const hasRefunds = refunds && refunds.length > 0;

	console.log("Refunds:", refunds);

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
        ) : hasRefunds ? (
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
      <CreateRefundModal
        isOpen={isModalOpen}
        isProcessing={isProcessing}
        onClose={handleModalClose}
        onSubmit={handleRefundSubmit}
      />
    </>
  );
};

export default RefundPayments;