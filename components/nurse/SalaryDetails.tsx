import React, { useState, useEffect } from "react";
import Loader from "../Loader";
import { fetchNurseSalaryPayments } from "@/app/actions/payroll/salary-actions";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";

interface SalaryPayment {
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
      <div className="bg-white rounded border border-gray-300 p-3 overflow-x-auto">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
            Payment History
        </h3>
        <table className="min-w-full text-sm border-collapse border border-gray-300 text-gray-800">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                  <th className="border border-gray-300 px-4 py-2 text-left">Pay Period</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Days Worked</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Hours Worked</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Avg Hourly Rate (₹)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Salary (₹)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Net Salary (₹)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Payment Details</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Info</th>
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
                  <td className="border border-gray-300 px-4 py-2 text-right">{payment.daysWorked}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{payment.hoursWorked}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                      ₹ {payment.averageHourlyRate?.toLocaleString() ?? "—"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                      ₹ {payment.salary?.toLocaleString() ?? "—"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                      <span className="font-semibold text-gray-900">
                          ₹ {payment.netSalary?.toLocaleString() ?? "—"}
                      </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                      <div className="flex flex-col gap-1">
                          <span
                              className={`px-2 py-1 rounded text-xs font-semibold w-fit ${
                                  payment.paymentStatus === "Paid"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                              }`}
                              title={payment.paymentStatus === "Paid" ? "Payment completed" : "Payment pending"}
                          >
                              {payment.paymentStatus}
                          </span>
                          <span className="text-gray-700 text-xs" title={payment.paymentMethod}>
                              {payment.paymentMethod || <span className="text-gray-400">—</span>}
                          </span>
                          <span className="text-gray-500 text-xs truncate" title={payment.transactionReference}>
                              {payment.transactionReference || <span className="text-gray-400">—</span>}
                          </span>
                      </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                      {payment.info ? (
                          <span
                              className="text-gray-800"
                              title={payment.info}
                          >
                              {payment.info}
                          </span>
                      ) : (
                          <span className="text-gray-400">—</span>
                      )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <button
                            type="button"
                            className="text-blue-600 hover:underline text-xs hover:bg-gray-200"
                            title="Edit"
                        >
                            Edit
                        </button>
                        <a
                            href={`/nurses/salary-report?nurseId=${nurseId}&payPeriodStart=${encodeURIComponent(payment.payPeriodStart)}&payPeriodEnd=${encodeURIComponent(payment.payPeriodEnd)}`}
                            className="text-blue-600 hover:underline text-xs"
                            title="View Report"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Details
                        </a>
                    </div>
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