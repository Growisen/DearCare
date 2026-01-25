import { Wallet, CheckCircle2 } from "lucide-react";

interface StatsSummaryProps {
  stats: { total_salary_amount: number; total_approved_amount: number };
  advanceTotals: { totalAmountGiven: number; totalAmountReturned: number };
  aggregatesLoading: boolean;
  advanceTotalsLoading: boolean;
}

export function StatsSummary({
  stats,
  advanceTotals,
  aggregatesLoading,
  advanceTotalsLoading,
}: StatsSummaryProps) {
  const statItems = [
    {
      label: "Salary Generated",
      value: stats.total_salary_amount,
      isLoading: aggregatesLoading,
      icon: Wallet,
      iconColor: "text-green-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Salary Approved",
      value: stats.total_approved_amount,
      isLoading: aggregatesLoading,
      icon: CheckCircle2,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Advance Paid",
      value: advanceTotals.totalAmountGiven ?? 0,
      isLoading: advanceTotalsLoading,
      icon: Wallet,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Advance Returned",
      value: advanceTotals.totalAmountReturned ?? 0,
      isLoading: advanceTotalsLoading,
      icon: CheckCircle2,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-sm overflow-hidden">
        {statItems.map((item) => (
          <div key={item.label} className="bg-white p-4 flex items-center gap-4">
            <div className={`p-2 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.iconColor}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-500 font-medium leading-none mb-1">
                {item.label}
              </span>
              {item.isLoading ? (
                <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                <span className="text-base font-bold text-gray-900 leading-none">
                  ₹{item.value.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}