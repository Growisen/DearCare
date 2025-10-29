import React, { useState, useEffect } from "react";
import Loader from "../Loader";
import { fetchNurseSalaryPayments } from "@/app/actions/payroll/salary-actions";
import { calculateNurseSalary, addNurseBonus, addNurseSalaryDeduction } from "@/app/actions/payroll/calculate-nurse-salary";
import ConfirmationModal from "../common/ConfirmationModal";
import ModalPortal from "../ui/ModalPortal";
import HourlySalaryCard from "./salary/HourlySalaryCard";
import PaymentHistoryTable from "./salary/PaymentHistoryTable";
import CreateSalaryModal from "./salary/CreateSalaryModal";
import AddBonusModal from "./salary/AddBonusModal";
import AddDeductionModal from "./salary/AddDeductionModal";
import { SalaryPayment } from "./types";

const SalaryDetails: React.FC<{ nurseId: number }> = ({ nurseId }) => {
  const [hourlySalary, setHourlySalary] = useState<number>(0);
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculatingId, setRecalculatingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SalaryPayment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [processingBonus, setProcessingBonus] = useState(false);
  const [processingDeduction, setProcessingDeduction] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await fetchNurseSalaryPayments(nurseId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedPayments: SalaryPayment[] = (data ?? []).map((p: any) => ({
        id: p.id,
        salary: p.salary ?? 0,
        info: p.info ?? "",
        averageHourlyRate: p.average_hourly_rate ?? 0,
        daysWorked: p.days_worked ?? 0,
        payPeriodStart: p.pay_period_start ?? "",
        payPeriodEnd: p.pay_period_end ?? "",
        payDate: p.pay_date ?? "",
        hoursWorked: p.hours_worked ?? 0,
        hourlyRate: p.hourly_rate ?? p.salary_config?.hourly_rate ?? 0,
        hourlyPay: p.hourly_pay ?? 0,
        netSalary: p.net_salary ?? 0,
        paymentStatus: p.payment_status === "paid" ? "Paid" : "Pending",
        paymentMethod: p.payment_method ?? "",
        transactionReference: p.transaction_reference ?? "",
        notes: p.notes ?? "",
        createdAt: p.created_at ?? "",
        updatedAt: p.updated_at ?? "",
        bonus: p.bonus ?? 0,
      }));

      setPayments(mappedPayments);

      if (mappedPayments.length > 0) {
        setHourlySalary(mappedPayments[0].averageHourlyRate ?? 0);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [nurseId]);

  const handleRecalculate = async (payment: SalaryPayment) => {
    setRecalculatingId(payment.id);
    try {
      const result = await calculateNurseSalary({
        nurseId,
        startDate: payment.payPeriodStart,
        endDate: payment.payPeriodEnd,
        id: payment.id,
      });
      if (result.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === payment.id
              ? {
                  ...p,
                  salary: result.salary,
                  daysWorked: result.daysWorked,
                  hoursWorked: result.hoursWorked,
                  info: result.info || p.info,
                  netSalary: result.netSalary || 0,
                }
              : p
          )
        );
      } else {
        alert("Recalculation failed: " + result.error);
      }
    } catch (error) {
      console.error("Recalculation error:", error);
      alert("Recalculation error.");
    } finally {
      setRecalculatingId(null);
    }
  };

  const handleOpenConfirm = (payment: SalaryPayment) => {
    setSelectedPayment(payment);
    setShowConfirm(true);
  };

  const handleOpenBonusModal = (payment: SalaryPayment) => {
    setSelectedPayment(payment);
    setShowBonusModal(true);
  };

  const handleOpenDeductionModal = (payment: SalaryPayment) => {
    setSelectedPayment(payment);
    setShowDeductionModal(true);
  };

  const handleConfirmRecalculate = async () => {
    if (!selectedPayment) return;
    setShowConfirm(false);
    await handleRecalculate(selectedPayment);
    setSelectedPayment(null);
  };

  const handleAddBonus = async (paymentId: number, bonusAmount: number, bonusReason: string) => {
    setProcessingBonus(true);
    try {
      const result = await addNurseBonus({
        paymentId,
        bonusAmount,
        bonusReason,
      });
      
      if (result.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  bonus: result.newBonus,
                  netSalary: result.netSalary ?? p.netSalary,
                  info: result.updatedInfo,
                }
              : p
          )
        );
        setShowBonusModal(false);
      } else {
        alert("Failed to add bonus: " + result.error);
      }
    } catch (error) {
      console.error("Error adding bonus:", error);
      alert("Error adding bonus.");
    } finally {
      setProcessingBonus(false);
    }
  };

  const handleAddDeduction = async (paymentId: number, deductionAmount: number, deductionReason: string) => {
    setProcessingDeduction(true);
    try {
      const result = await addNurseSalaryDeduction({
        paymentId,
        deductionAmount,
        deductionReason,
      });

      if (result.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  deduction: result.newDeduction,
                  netSalary: result.netSalary ?? p.netSalary,
                  info: result.updatedInfo,
                }
              : p
          )
        );
        setShowDeductionModal(false);
      } else {
        alert("Failed to add deduction: " + result.error);
      }
    } catch (error) {
      console.error("Error adding deduction:", error);
      alert("Error adding deduction.");
    } finally {
      setProcessingDeduction(false);
    }
  };

  const handleCreateSalary = async (
    startDate: string,
    endDate: string,
  ) => {
    setCreating(true);
    try {
      const result = await calculateNurseSalary({
        nurseId,
        startDate,
        endDate,
      });

      if (result.success) {
        await fetchPayments();
        setShowCreateModal(false);
      } else {
        alert("Salary creation failed: " + result.error);
      }
    } catch (error) {
      console.error("Error creating salary:", error);
      alert("Error creating salary.");
    } finally {
      setCreating(false);
    }
  };

  if (loading && payments.length === 0) {
    return <Loader message="Loading salary details..." />;
  }

  return (
    <div className="space-y-8 p-5">
      <HourlySalaryCard hourlySalary={hourlySalary} />

      <PaymentHistoryTable
        payments={payments}
        nurseId={nurseId}
        recalculatingId={recalculatingId}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onOpenConfirmModal={handleOpenConfirm}
        onOpenBonusModal={handleOpenBonusModal}
        onOpenDeductionModal={handleOpenDeductionModal}
      />

      <ModalPortal>
        <ConfirmationModal
          isOpen={showConfirm}
          title="Recalculate Salary?"
          message="Are you sure you want to recalculate the salary for this pay period? This action cannot be undone."
          onConfirm={handleConfirmRecalculate}
          onCancel={() => setShowConfirm(false)}
          confirmButtonText="Recalculate"
          confirmButtonColor="blue"
          isLoading={!!recalculatingId}
        />
      </ModalPortal>

      <ModalPortal>
        <CreateSalaryModal
          isOpen={showCreateModal}
          isCreating={creating}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSalary}
        />
      </ModalPortal>

      <ModalPortal>
        <AddBonusModal
          isOpen={showBonusModal}
          isProcessing={processingBonus}
          payment={selectedPayment}
          onClose={() => setShowBonusModal(false)}
          onSubmit={handleAddBonus}
        />
      </ModalPortal>

      <ModalPortal>
        <AddDeductionModal
          isOpen={showDeductionModal}
          isProcessing={processingDeduction}
          payment={selectedPayment}
          onClose={() => setShowDeductionModal(false)}
          onSubmit={handleAddDeduction}
        />
      </ModalPortal>
    </div>
  );
};

export default SalaryDetails;