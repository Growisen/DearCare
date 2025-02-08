import { Card } from "../ui/card"
import { CountUp } from "use-count-up"
import { Users, Calendar, Building2, Activity, TrendingUp } from "lucide-react"

interface Stat {
  title: string;
  value: number;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
  bgColor: string;
  iconColor: string;
}

import { LucideIcon } from "lucide-react";

const stats: Stat[] = [
    { title: "Active Nurses", value: 125, icon: Users, trend: "+8%", trendUp: true, bgColor: "bg-blue-100/30", iconColor: "text-blue-500" },
    { title: "Current Assignments", value: 98, icon: Calendar, trend: "+5%", trendUp: true, bgColor: "bg-emerald-100/30", iconColor: "text-emerald-500" },
    { title: "Open Requests", value: 15, icon: Activity, trend: "-3%", trendUp: false, bgColor: "bg-amber-100/30", iconColor: "text-amber-500" },
    { title: "Active Clients", value: 42, icon: Building2, trend: "+4%", trendUp: true, bgColor: "bg-purple-100/30", iconColor: "text-purple-500" },
]

export default function Stats() {
  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title} className="p-4 group hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm border border-gray-100/20 hover:border-gray-200/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-medium text-gray-600">{stat.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  <CountUp isCounting end={stat.value} duration={2} />
                </span>
                <span className={`text-xs flex items-center gap-0.5 ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}
