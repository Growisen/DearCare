import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchNurseSalaryPayments,
  fetchAggregatedSalaries,
  approveSalaryPayment,
} from "@/app/actions/payroll/salary-actions";
import {
  calculateNurseSalary,
  addNurseBonus,
  addNurseSalaryDeduction
} from "@/app/actions/payroll/calculate-nurse-salary";
import { SalaryPayment } from "@/types/nurse.salary.types";
import useOrgStore from "@/app/stores/UseOrgStore";
import { toast } from "sonner";

type ModalState = 
  | { type: "IDLE" }
  | { type: "CREATE" }
  | { type: "CONFIRM_RECALC"; payment: SalaryPayment }
  | { type: "ADD_BONUS"; payment: SalaryPayment }
  | { type: "ADD_DEDUCTION"; payment: SalaryPayment }
  | { type: "APPROVE"; payment: SalaryPayment };

type ProcessingState = {
  type: "IDLE" | "CREATING" | "RECALCULATING" | "ADDING_BONUS" | "ADDING_DEDUCTION" | "APPROVING";
  id?: number;
};

type ApprovalFormState = {
  amount: number;
  type: string;
  note: string;
};

const PAYMENT_TYPES = ["cash", "bank transfer"];

export const useNurseSalaryById = (nurseId: number) => {
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [aggregates, setAggregates] = useState<{ approved: number; pending: number } | null>(null);
  const [loading, setLoading] = useState({ payments: true, aggregates: false });
  const [activeModal, setActiveModal] = useState<ModalState>({ type: "IDLE" });
  const [approvalForm, setApprovalForm] = useState<ApprovalFormState>({ amount: 0, type: PAYMENT_TYPES[0], note: "" });
  const [processing, setProcessing] = useState<ProcessingState>({ type: "IDLE" });

  const { organization } = useOrgStore();

  const hourlySalary = useMemo(() => 
    payments.length > 0 ? payments[0].averageHourlyRate ?? 0 : 0
  , [payments]);

  const fetchPayments = useCallback(async () => {
    setLoading(prev => ({ ...prev, payments: true }));
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
        paymentStatus: p.payment_status === "paid" ? "Paid"
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
				paymentHistory: p.payment_history,
        balanceAmount: p.balance_amount ?? 0,
      }));
      setPayments(mappedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  }, [nurseId]);

  const fetchSalaryAggregates = useCallback(async () => {
    setLoading(prev => ({ ...prev, aggregates: true }));
    try {
      const result = await fetchAggregatedSalaries(nurseId);
      setAggregates(result.data);
    } catch (error) {
      console.error("Error fetching aggregates:", error);
    } finally {
      setLoading(prev => ({ ...prev, aggregates: false }));
    }
  }, [nurseId]);

  useEffect(() => {
    fetchPayments();
    fetchSalaryAggregates();
  }, [nurseId, fetchPayments, fetchSalaryAggregates]);

  const closeModal = () => setActiveModal({ type: "IDLE" });
  
  const openCreateModal = () => setActiveModal({ type: "CREATE" });
  
  const openRecalculateConfirm = (payment: SalaryPayment) => 
    setActiveModal({ type: "CONFIRM_RECALC", payment });
  
  const openBonusModal = (payment: SalaryPayment) => 
    setActiveModal({ type: "ADD_BONUS", payment });
  
  const openDeductionModal = (payment: SalaryPayment) => 
    setActiveModal({ type: "ADD_DEDUCTION", payment });
  
  const openApproveModal = (payment: SalaryPayment) => {
    setApprovalForm({ amount: payment.balanceAmount || 0, type: PAYMENT_TYPES[0], note: "" });
    setActiveModal({ type: "APPROVE", payment });
  };

  const handleRecalculate = async () => {
    if (activeModal.type !== "CONFIRM_RECALC") return;
    const { payment } = activeModal;
    
    closeModal();
    setProcessing({ type: "RECALCULATING", id: payment.id });

    try {
      const result = await calculateNurseSalary({
        nurseId,
        startDate: payment.payPeriodStart,
        endDate: payment.payPeriodEnd,
        id: payment.id,
      });

      if (result.success) {
        setPayments(prev => prev.map(p => p.id === payment.id ? {
          ...p,
          salary: result.salary,
          daysWorked: result.daysWorked,
          hoursWorked: result.hoursWorked,
          info: result.info || p.info,
          netSalary: result.netSalary || 0,
        } : p));
      } else {
        toast.error("Recalculation failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Recalculation error.");
    } finally {
      setProcessing({ type: "IDLE" });
    }
  };

  const handleAddBonus = async (paymentId: number, bonusAmount: number, bonusReason: string) => {
    setProcessing({ type: "ADDING_BONUS", id: paymentId });
    try {
      const result = await addNurseBonus({ paymentId, bonusAmount, bonusReason });
      if (result.success) {
        setPayments(prev => prev.map(p => p.id === paymentId ? {
          ...p,
          bonus: result.newBonus,
          netSalary: result.netSalary ?? p.netSalary,
          info: result.updatedInfo,
        } : p));
        closeModal();
      } else {
        toast.error("Failed to add bonus: " + result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding bonus.");
    } finally {
      setProcessing({ type: "IDLE" });
    }
  };

  const handleAddDeduction = async (paymentId: number, deductionAmount: number, deductionReason: string) => {
    setProcessing({ type: "ADDING_DEDUCTION", id: paymentId });
    try {
      const result = await addNurseSalaryDeduction({ paymentId, deductionAmount, deductionReason });
      if (result.success) {
        setPayments(prev => prev.map(p => p.id === paymentId ? {
          ...p,
          deduction: result.newDeduction,
          netSalary: result.netSalary ?? p.netSalary,
          info: result.updatedInfo,
        } : p));
        closeModal();
      } else {
        toast.error("Failed to add deduction: " + result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding deduction.");
    } finally {
      setProcessing({ type: "IDLE" });
    }
  };

  const handleCreateSalary = async (startDate: string, endDate: string) => {
    setProcessing({ type: "CREATING" });
    try {
      const result = await calculateNurseSalary({ nurseId, startDate, endDate });
      if (result.success) {
        await fetchPayments();
        closeModal();
      } else {
        toast.error("Salary creation failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating salary.");
    } finally {
      setProcessing({ type: "IDLE" });
    }
  };

  const handleApprove = async () => {
    if (activeModal.type !== "APPROVE") return;
    const { payment } = activeModal;

    setProcessing({ type: "APPROVING", id: payment.id });

    const tenantMap = {
      "TataHomeNursing": "TATANursing",
      "DearCare": "Dearcare"
    } as const;
    const tenant = organization && organization in tenantMap ? tenantMap[organization as keyof typeof tenantMap] : "";

    try {
      const result = await approveSalaryPayment({
        paymentId: payment.id,
        nurseId,
        netSalary: approvalForm.amount,
        info: approvalForm.note,
        tenant: tenant, 
        paymentType: approvalForm.type,
      });

      await fetchPayments();

      if (result.success) {
        toast.success("Salary payment approved!");
      } else {
        toast.error("Failed to approve: " + (result.error || result.statusResult?.error));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error approving salary payment.");
    } finally {
			closeModal();
      setProcessing({ type: "IDLE" });
    }
  };

  return {
    payments,
    aggregates,
    hourlySalary,
    loadingPayments: loading.payments,
    loadingAggregates: loading.aggregates,
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
  };
};