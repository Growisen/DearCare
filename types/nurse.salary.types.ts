export interface SalaryPaymentDebtRecord {
  nurse_reg_no: string;
  full_name: string;
  salary_payment_id: number;
  nurse_id: number;
  pay_period_start: string;
  pay_period_end: string;
  net_salary: number;
  payment_status: string;
  gross_salary?: number;
  info?: string;
  created_at: string;
  bonus?: number;
  deductions?: number;
  total_outstanding_debt: number;
  total_installments_due: number;
  active_loan_count: number;
  has_active_debt: boolean;
}

export interface SalaryPayment {
  id: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  hoursWorked: number;
  averageHourlyRate?: number;
  daysWorked: number;
  salary: number;
  info: string;
  hourlyRate: number;
  hourlyPay: number;
  netSalary: number;
  paymentStatus: "Paid" | "Pending" | "Failed" | "Approved" | "Rejected" | "paid" | "pending" | "failed" | "approved" | "rejected";
  paymentMethod: string;
  transactionReference: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  bonus?: number;
}