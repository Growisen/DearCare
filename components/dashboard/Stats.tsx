import { Card } from "../ui/card"
import { CountUp } from "use-count-up"
import { Users, Calendar, Building2, Activity } from "lucide-react"
import { Stat } from "@/types/dashboard.types"
import { useState, useEffect } from "react"

interface StatsProps {
  statsData?: {
    activeNurses: { count: number; trend: string; trendUp: boolean };
    currentAssignments: { count: number; trend: string; trendUp: boolean };
    openRequests: { count: number; trend: string; trendUp: boolean };
    approvedClients: { count: number; trend: string; trendUp: boolean };
  };
}

export default function Stats({ statsData }: StatsProps) {
  const [stats, setStats] = useState<Stat[]>([
    { title: "Active Nurses", value: 0, icon: Users, trend: "0%", trendUp: true, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
    { title: "Total Assignments", value: 0, icon: Calendar, trend: "0%", trendUp: true, bgColor: "bg-emerald-100", iconColor: "text-emerald-600" },
    { title: "Open Requests", value: 0, icon: Activity, trend: "0%", trendUp: true, bgColor: "bg-amber-100", iconColor: "text-amber-600" },
    { title: "Approved Clients", value: 0, icon: Building2, trend: "0%", trendUp: true, bgColor: "bg-purple-100", iconColor: "text-purple-600" },
  ]);
  const [isLoading, setIsLoading] = useState(!statsData);

  useEffect(() => {
    if (statsData) {
      // Update stats with data from props
      setStats(prevStats => prevStats.map(stat => {
        if (stat.title === "Active Nurses") {
          return { ...stat, value: statsData.activeNurses.count, trend: statsData.activeNurses.trend, trendUp: statsData.activeNurses.trendUp };
        } else if (stat.title === "Total Assignments") {
          return { ...stat, value: statsData.currentAssignments.count, trend: statsData.currentAssignments.trend, trendUp: statsData.currentAssignments.trendUp };
        } else if (stat.title === "Open Requests") {
          return { ...stat, value: statsData.openRequests.count, trend: statsData.openRequests.trend, trendUp: statsData.openRequests.trendUp };
        } else if (stat.title === "Approved Clients") {
          return { ...stat, value: statsData.approvedClients.count, trend: statsData.approvedClients.trend, trendUp: statsData.approvedClients.trendUp };
        }
        return stat;
      }));
      setIsLoading(false);
    }
  }, [statsData]);

  return (
    <>
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="p-3 bg-white border border-slate-200 shadow-none rounded-sm h-full flex flex-col justify-center"
        >
          <div className="flex items-center gap-2.5 w-full">
            <div className={`min-w-8 w-8 h-8 rounded-sm ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs xs:text-sm font-medium text-slate-800 truncate">{stat.title}</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-base xs:text-lg font-semibold text-slate-900 whitespace-nowrap">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <CountUp isCounting end={stat.value} duration={2} />
                  )}
                </span>
                {/* Uncomment if you want to show trend
                <span className={`text-xs flex items-center gap-0.5 ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
                  {stat.trend}
                </span> */}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}