import React from "react";
import ConfirmationModal from "../common/ConfirmationModal";
import HourlySalaryCard from "./salary/HourlySalaryCard";
import PaymentHistoryTable from "./salary/PaymentHistoryTable";
import CreateSalaryModal from "./salary/CreateSalaryModal";
import AddBonusModal from "./salary/AddBonusModal";
import AddDeductionModal from "./salary/AddDeductionModal";
import ApproveSalaryModal from "@/components/nurse/ApproveSalaryModal";
import { useNurseSalaryById } from "@/hooks/useNurseSalaryById";

const SalaryDetails: React.FC<{ nurseId: number }> = ({ nurseId }) => {
  const {
    payments,
    aggregates,
    hourlySalary,
    loadingPayments,
    loadingAggregates,
    activeModal,
    approvalForm,
    processing,
    closeModal,
    openCreateModal,
    openRecalculateConfirm,
    openBonusModal,
    openDeductionModal,
    openApproveModal,
    setApprovalForm,
    handleRecalculate,
    handleCreateSalary,
    handleAddBonus,
    handleAddDeduction,
    handleApprove
  } = useNurseSalaryById(nurseId);

  const selectedPayment = 'payment' in activeModal ? activeModal.payment : null;

  return (
    <div className="space-y-8 p-5">
      <HourlySalaryCard 
        hourlySalary={hourlySalary}
        aggregatedSalaries={aggregates || { approved: 0, pending: 0 }} 
        loading={loadingAggregates}
      />

      <PaymentHistoryTable
        payments={payments}
        nurseId={nurseId}
        recalculatingId={processing.type === "RECALCULATING" ? processing.id ?? null : null}
        approvingId={processing.type === "APPROVING" ? processing.id ?? null : null}
        onOpenCreateModal={openCreateModal}
        onOpenConfirmModal={openRecalculateConfirm}
        onOpenBonusModal={openBonusModal}
        onOpenDeductionModal={openDeductionModal}
        handleApprove={openApproveModal}
        loading={loadingPayments && payments.length === 0}
      />

      <ConfirmationModal
        isOpen={activeModal.type === "CONFIRM_RECALC"}
        title="Recalculate Salary?"
        message="Are you sure you want to recalculate the salary for this pay period? This action cannot be undone."
        onConfirm={handleRecalculate}
        onCancel={closeModal}
        confirmButtonText="Recalculate"
        confirmButtonColor="blue"
        isLoading={processing.type === "RECALCULATING"}
      />

      <CreateSalaryModal
        isOpen={activeModal.type === "CREATE"}
        isCreating={processing.type === "CREATING"}
        onClose={closeModal}
        onSubmit={handleCreateSalary}
      />

      <AddBonusModal
        isOpen={activeModal.type === "ADD_BONUS"}
        isProcessing={processing.type === "ADDING_BONUS"}
        payment={selectedPayment}
        onClose={closeModal}
        onSubmit={handleAddBonus}
      />

      <AddDeductionModal
        isOpen={activeModal.type === "ADD_DEDUCTION"}
        isProcessing={processing.type === "ADDING_DEDUCTION"}
        payment={selectedPayment}
        onClose={closeModal}
        onSubmit={handleAddDeduction}
        />

      <ApproveSalaryModal
        isOpen={activeModal.type === "APPROVE"}
        isProcessing={processing.type === "APPROVING"}
        payment={selectedPayment}
        paymentType={approvalForm.type}
        amount={approvalForm.amount}
        onPaymentTypeChange={(type) => setApprovalForm(prev => ({ ...prev, type }))}
        onAmountChange={(amount) => setApprovalForm(prev => ({ ...prev, amount }))}
        onClose={closeModal}
        onSubmit={handleApprove}
      />
    </div>
  );
};

export default SalaryDetails;