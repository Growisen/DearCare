import React, { useState, useEffect } from "react";
import Loader from "../Loader";
import { fetchNurseSalaryPayments } from "@/app/actions/payroll/salary-actions";
import { calculateNurseSalary } from "@/app/actions/payroll/calculate-nurse-salary";
import ConfirmationModal from "../common/ConfirmationModal";
import ModalPortal from "../ui/ModalPortal";
import HourlySalaryCard from "./salary/HourlySalaryCard";
import PaymentHistoryTable from "./salary/PaymentHistoryTable";
import CreateSalaryModal from "./salary/CreateSalaryModal";
import { SalaryPayment } from "./types";

const SalaryDetails: React.FC<{ nurseId: number }> = ({ nurseId }) => {
  const [hourlySalary, setHourlySalary] = useState<number>(0);
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculatingId, setRecalculatingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SalaryPayment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

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
      }));

      setPayments(mappedPayments);

      if (mappedPayments.length > 0) {
        setHourlySalary(mappedPayments[0].hourlyRate);
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

  // Handler to recalculate salary for a payment
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
        // Update the payment in the list with recalculated values
        setPayments((prev) =>
          prev.map((p) =>
            p.id === payment.id
              ? {
                  ...p,
                  salary: result.salary,
                  daysWorked: result.daysWorked,
                  hoursWorked: result.hoursWorked,
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

  // Handler to open confirmation modal
  const handleOpenConfirm = (payment: SalaryPayment) => {
    setSelectedPayment(payment);
    setShowConfirm(true);
  };

  // Handler to actually recalculate after confirmation
  const handleConfirmRecalculate = async () => {
    if (!selectedPayment) return;
    setShowConfirm(false);
    await handleRecalculate(selectedPayment);
    setSelectedPayment(null);
  };

  const handleCreateSalary = async (startDate: string, endDate: string) => {
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
    <div className="space-y-8">
      {/* Hourly Salary Card */}
      <HourlySalaryCard hourlySalary={hourlySalary} />

      {/* Salary Payment History Table */}
      <PaymentHistoryTable
        payments={payments}
        nurseId={nurseId}
        recalculatingId={recalculatingId}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onOpenConfirmModal={handleOpenConfirm}
      />

      {/* Confirmation Modal */}
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

      {/* Create Salary Modal */}
      <ModalPortal>
        <CreateSalaryModal
          isOpen={showCreateModal}
          isCreating={creating}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSalary}
        />
      </ModalPortal>
    </div>
  );
};

export default SalaryDetails;