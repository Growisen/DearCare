import { PlayCircle, PauseCircle, Activity, AlertCircle } from "lucide-react";

interface StatsSummaryProps {
  stats: {
    starting_today_count: number;
    ending_today_count: number;
    active_count: number;
    expiring_soon_count: number;
  };
  loading: boolean;
}

export function StatsSummary({
  stats,
  loading,
}: StatsSummaryProps) {
  const statItems = [
    {
      label: "Starting Today",
      value: stats.starting_today_count,
      isLoading: loading,
      icon: PlayCircle,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Ending Today",
      value: stats.ending_today_count,
      isLoading: loading,
      icon: PauseCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Active Assignments",
      value: stats.active_count,
      isLoading: loading,
      icon: Activity,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Expiring Soon (In 7 Days)",
      value: stats.expiring_soon_count,
      isLoading: loading,
      icon: AlertCircle,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
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
              {item.isLoading && (!item.value || item.value === 0) ? (
                <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                <span className="text-base font-bold text-gray-900 leading-none">
                  {item.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}