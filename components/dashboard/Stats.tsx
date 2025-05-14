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
    { title: "Active Nurses", value: 0, icon: Users, trend: "0%", trendUp: true, bgColor: "bg-blue-100/30", iconColor: "text-blue-500" },
    { title: "Current Assignments", value: 0, icon: Calendar, trend: "0%", trendUp: true, bgColor: "bg-emerald-100/30", iconColor: "text-emerald-500" },
    { title: "Open Requests", value: 0, icon: Activity, trend: "0%", trendUp: true, bgColor: "bg-amber-100/30", iconColor: "text-amber-500" },
    { title: "Approved Clients", value: 0, icon: Building2, trend: "0%", trendUp: true, bgColor: "bg-purple-100/30", iconColor: "text-purple-500" },
  ]);
  const [isLoading, setIsLoading] = useState(!statsData);

  useEffect(() => {
    if (statsData) {
      // Update stats with data from props
      setStats(prevStats => prevStats.map(stat => {
        if (stat.title === "Active Nurses") {
          return { ...stat, value: statsData.activeNurses.count, trend: statsData.activeNurses.trend, trendUp: statsData.activeNurses.trendUp };
        } else if (stat.title === "Current Assignments") {
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
        <Card key={stat.title} className="p-4 group hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm border border-gray-100/20 hover:border-gray-200/30 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-105 mb-2 sm:mb-0`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <h3 className="text-xs font-medium text-gray-600 truncate">{stat.title}</h3>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <CountUp isCounting end={stat.value} duration={2} />
                  )}
                </span>
                {/* <span className={`text-xs flex items-center gap-0.5 ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
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