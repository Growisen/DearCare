import React, { useState, useEffect } from "react";
import Loader from "../Loader";
import { fetchNurseSalaryPayments } from "@/app/actions/payroll/salary-actions"; // <-- Import
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";

interface SalaryPayment {
  id: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  hoursWorked: number;
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

const SalaryDetails: React.FC<{ nurseId: number }> = ({ nurseId }) => {
  const [hourlySalary, setHourlySalary] = useState<number>(0);
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchNurseSalaryPayments(nurseId)
        .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedPayments: SalaryPayment[] = (data ?? []).map((p: any) => ({
            id: p.id,
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
        setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [nurseId]);


  if (loading) {
    return <Loader message='Loading salary details...' />;
  }

  return (
    <div className="space-y-8">
      {/* Hourly Salary Card */}
      <div className="bg-white rounded border border-gray-300 p-5">
        <h3 className="text-base font-semibold text-gray-900">Hourly Salary</h3>
        <p className="text-2xl font-bold text-gray-800 mt-2">
          ₹ {hourlySalary.toLocaleString()}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Current hourly wage assigned to this nurse.
        </p>
      </div>

      {/* Salary Payment History Table */}
      <div className="bg-white rounded border border-gray-300 p-5 overflow-x-auto">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
            Payment History
        </h3>
        <table className="min-w-full text-sm border-collapse border border-gray-300 text-gray-800">
            <thead>
                <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-300 px-4 py-2 text-left">Pay Period</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Pay Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Hours Worked</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Hourly Rate (₹)</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Net Salary (₹)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Payment Method</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Payment Info</th>
                </tr>
            </thead>
            <tbody>
            {payments.map((payment) => (
                <tr
                key={payment.id}
                className="hover:bg-gray-50 transition-colors duration-200"
                >
                <td className="border border-gray-300 px-4 py-2">
                    {formatDateToDDMMYYYY(payment.payPeriodStart)} → {formatDateToDDMMYYYY(payment.payPeriodEnd)}
                </td>
                <td className="border border-gray-300 px-4 py-2">{formatDateToDDMMYYYY(payment.payDate)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{payment.hoursWorked}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                    {payment.hourlyRate.toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                    {payment.netSalary.toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">{payment.paymentMethod}</td>
                <td className="border border-gray-300 px-4 py-2">
                    <span className="font-medium">{payment.transactionReference}</span>
                    {" • "}
                    <span
                    className={payment.paymentStatus === "Paid" ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}
                    >
                    {payment.paymentStatus}
                    </span>
                </td>
                </tr>
            ))}
            </tbody>

        </table>
        </div>

    </div>
  );
};

export default SalaryDetails;