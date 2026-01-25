import React from "react";
import { Clock, CheckCircle2, Hourglass, Wallet } from "lucide-react";

interface HourlySalaryCardProps {
  hourlySalary: number;
  aggregatedSalaries: {
    approved: number;
    pending: number;
  };
  loading?: boolean;
}

export default function HourlySalaryCard({
  hourlySalary,
  aggregatedSalaries,
  loading,
}: HourlySalaryCardProps) {
  const total = aggregatedSalaries.approved + aggregatedSalaries.pending;

  console.log('Aggregated Salaries:', aggregatedSalaries);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const ValueSkeleton = () => (
    <div className="h-7 w-24 bg-slate-200 rounded animate-pulse mt-0.5" />
  );

  const cardData = [
    {
      label: "Hourly Rate",
      value: formatCurrency(hourlySalary),
      icon: <Clock className="w-5 h-5 text-slate-500" />,
      bgColor: "bg-slate-50",
      textColor: "text-slate-500",
      suffix: "/hr",
    },
    {
      label: "Approved",
      value: formatCurrency(aggregatedSalaries.approved),
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Pending",
      value: formatCurrency(aggregatedSalaries.pending),
      icon: <Hourglass className="w-5 h-5 text-amber-600" />,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Total Generated",
      value: formatCurrency(total),
      icon: <Wallet className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-sm grid grid-cols-1 md:grid-cols-2 
      lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100"
    >
      {cardData.map(({ label, value, icon, bgColor, suffix }, index) => (
        <div key={index} className="flex px-6 py-4 items-center gap-4">
          <div className={`p-2 ${bgColor} rounded-sm`}>{icon}</div>
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            {loading ? (
              <ValueSkeleton />
            ) : (
              <p className="text-xl font-bold text-slate-900 tabular-nums">
                {value}
                {suffix && <span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span>}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}