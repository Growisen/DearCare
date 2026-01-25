import { PaymentHistoryEntry } from "@/types/nurse.salary.types";

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
  paymentHistory?: PaymentHistoryEntry[];
  balanceAmount: number;
}