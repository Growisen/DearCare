import React from "react";
import { Wallet, Banknote } from "lucide-react";

type PaymentStatsProps = {
  data: { totalAmountReceived: number; totalCommissionGenerated: number } | null;
  loading: boolean;
};

export default function PaymentStats({ data, loading }: PaymentStatsProps) {
  const statItems = [
    {
      label: "Total Amount Received",
      value: data?.totalAmountReceived ?? 0,
      icon: Wallet,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Commission",
      value: data?.totalCommissionGenerated ?? 0,
      icon: Banknote,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="w-full mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-sm overflow-hidden">
        {statItems.map((item) => (
          <div key={item.label} className="bg-white p-4 flex items-center gap-4">
            <div className={`p-2 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.iconColor}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-500 font-medium leading-none mb-1">
                {item.label}
              </span>
              {loading ? (
                <div className="h-5 w-24 bg-gray-100 animate-pulse rounded mt-1" />
              ) : (
                <span className="text-xl font-bold text-gray-900 leading-none mt-1">
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