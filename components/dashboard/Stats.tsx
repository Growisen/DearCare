import { Card } from "../ui/card"
import { CountUp } from "use-count-up"
import { Users, Calendar, Building2, Activity, LucideIcon } from "lucide-react"

interface StatsProps {
  statsData?: {
    activeNurses: { count: number; trend: string; trendUp: boolean };
    currentAssignments: { count: number; trend: string; trendUp: boolean };
    openRequests: { count: number; trend: string; trendUp: boolean };
    approvedClients: { count: number; trend: string; trendUp: boolean };
  };
  isLoading?: boolean;
}

type StatKey = keyof NonNullable<StatsProps['statsData']>;

interface StatConfigItem {
  key: StatKey;
  title: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

const STAT_CONFIG: StatConfigItem[] = [
  { key: "activeNurses", title: "Active Nurses", icon: Users, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
  { key: "currentAssignments", title: "Total Assignments", icon: Calendar, bgColor: "bg-emerald-100", iconColor: "text-emerald-600" },
  { key: "openRequests", title: "Open Requests", icon: Activity, bgColor: "bg-amber-100", iconColor: "text-amber-600" },
  { key: "approvedClients", title: "Approved Clients", icon: Building2, bgColor: "bg-purple-100", iconColor: "text-purple-600" },
];

export default function Stats({ statsData, isLoading = false }: StatsProps) {
  return (
    <>
      {STAT_CONFIG.map((stat) => {
        const data = statsData?.[stat.key];
        
        return (
          <Card 
            key={stat.key} 
            className="p-3 bg-white border border-slate-200 shadow-none rounded-sm h-full flex flex-col justify-center"
          >
            <div className="flex items-center gap-2.5 w-full">
              <div className={`min-w-8 w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0
                ${stat.bgColor} ${isLoading ? "opacity-60" : ""}`}>
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              {isLoading ? (
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs xs:text-sm font-medium text-slate-800 truncate">{stat.title}</h3>
                  <div className="space-y-2">
                    <div className="h-5 w-16 bg-slate-200 rounded-sm animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs xs:text-sm font-medium text-slate-800 truncate">{stat.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base xs:text-lg font-semibold text-slate-900 whitespace-nowrap">
                      <CountUp isCounting end={data?.count || 0} duration={2} />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </>
  )
}