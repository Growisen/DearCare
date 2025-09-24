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
  paymentStatus: "Paid" | "Pending";
  paymentMethod: string;
  transactionReference: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}