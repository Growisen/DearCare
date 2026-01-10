import React, { useState, useEffect } from "react";
import Loader from "../Loader";
import { 
  fetchNurseSalaryPayments,
  fetchAggregatedSalaries
 } from "@/app/actions/payroll/salary-actions";
import { 
  calculateNurseSalary, 
  addNurseBonus, 
  addNurseSalaryDeduction, 
  updateSalaryPaymentStatus 
} from "@/app/actions/payroll/calculate-nurse-salary";
import ConfirmationModal from "../common/ConfirmationModal";
import ModalPortal from "../ui/ModalPortal";
import HourlySalaryCard from "./salary/HourlySalaryCard";
import PaymentHistoryTable from "./salary/PaymentHistoryTable";
import CreateSalaryModal from "./salary/CreateSalaryModal";
import AddBonusModal from "./salary/AddBonusModal";
import AddDeductionModal from "./salary/AddDeductionModal";
import { SalaryPayment } from "./types";
import useOrgStore from "@/app/stores/UseOrgStore";
import { toast } from "sonner";

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
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [paymentToApprove, setPaymentToApprove] = useState<SalaryPayment | null>(null);
  const { organization } = useOrgStore()
  const [aggregates, setAggregates] = useState<{ approved: number; pending: number } | null>(null);
  const [aggregatesLoading, setAggregatesLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await fetchNurseSalaryPayments(nurseId);
      console.log("data fetched", data)
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
        paymentStatus:
          p.payment_status === "paid" ? "Paid"
          : p.payment_status === "approved" ? "Approved"
          : p.payment_status === "failed" ? "Failed"
          : p.payment_status === "pending" ? "Pending"
          : p.payment_status ?? "Pending",
        paymentMethod: p.payment_method ?? "",
        transactionReference: p.transaction_reference ?? "",
        notes: p.notes ?? "",
        createdAt: p.created_at ?? "",
        updatedAt: p.updated_at ?? "",
        bonus: p.bonus ?? 0,
      }));

      setPayments([]);
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

  const fetchSalaryAggregates = async () => {
    try {
      setAggregatesLoading(true);
      const aggregates = await fetchAggregatedSalaries(nurseId);
      setAggregates(aggregates.data);
    } catch (error) {
      console.error("Error fetching salary aggregates:", error);
    } finally {
      setAggregatesLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchSalaryAggregates();
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

  const handleOpenApproveConfirm = (payment: SalaryPayment) => {
    setPaymentToApprove(payment);
    setShowApproveConfirm(true);
  };

  const handleConfirmRecalculate = async () => {
    if (!selectedPayment) return;
    setShowConfirm(false);
    await handleRecalculate(selectedPayment);
    setSelectedPayment(null);
  };

  const handleConfirmApprove = async () => {
    if (!paymentToApprove) return;
    setShowApproveConfirm(false);
    await handleApprove(paymentToApprove);
    setPaymentToApprove(null);
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
        toast.error("Salary creation failed: " + result.error);
      }
    } catch (error) {
      console.error("Error creating salary:", error);
      toast.error("Error creating salary.");
    } finally {
      setCreating(false);
    }
  };


  const getAdmittedTypeFilter = (): 'Dearcare' | 'TATANursing' | "" => {
    if (!organization) return "";
    if (organization === "TataHomeNursing") return "TATANursing";
    if (organization === "DearCare") return "Dearcare";
    return "";
  };

  const handleApprove = async (payment: SalaryPayment) => {
    setApprovingId(payment.id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DAYBOOK_API_URL}/daybook/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salary_id: payment.id,
          nurse_id: String(nurseId),
          amount: payment.netSalary,
          payment_type: "outgoing",
          pay_status: "un_paid",
          description: payment.info,
          tenant: getAdmittedTypeFilter(),
        }),
      });

      const result = await response.json();

      if (!result.error) {
        const statusResult = await updateSalaryPaymentStatus({
          paymentId: payment.id,
          status: "approved",
        });
        await fetchPayments();
        if (statusResult.success) {
          toast.success("Salary payment approved!", {
            action: {
              label: "OK",
              onClick: async () => {
                toast.dismiss();
                await fetchPayments();
                console.log("Data refetched after approval.");
              },
            },
          });
        } else {
          toast.error("Failed to update status: " + statusResult.error);
        }
      } else {
        toast.error("Failed to approve: " + (result.error || response.statusText));
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Error approving salary payment.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-8 p-5">
      <HourlySalaryCard 
        hourlySalary={hourlySalary}
        aggregatedSalaries={aggregates || { approved: 0, pending: 0 }} 
        loading={aggregatesLoading}
      />

      <PaymentHistoryTable
        payments={payments}
        nurseId={nurseId}
        recalculatingId={recalculatingId}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onOpenConfirmModal={handleOpenConfirm}
        onOpenBonusModal={handleOpenBonusModal}
        onOpenDeductionModal={handleOpenDeductionModal}
        handleApprove={handleOpenApproveConfirm}
        approvingId={approvingId}
        loading={loading && payments.length === 0}
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

      <ModalPortal>
        <ConfirmationModal
          isOpen={showApproveConfirm}
          title="Approve Salary Payment?"
          message="Are you sure you want to approve this salary payment? This action cannot be undone."
          onConfirm={handleConfirmApprove}
          onCancel={() => setShowApproveConfirm(false)}
          confirmButtonText="Approve"
          confirmButtonColor="blue"
          isLoading={!!approvingId}
        />
      </ModalPortal>
    </div>
  );
};

export default SalaryDetails;