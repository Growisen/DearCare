import { Card } from "../ui/card"
import { Activity } from "lucide-react"

const activities = [
  { text: "New nurse assignment in Kochi", time: "2h ago" },
  { text: "Staff training at Kaloor center completed", time: "4h ago" },
  { text: "Nurse assigned to client in Trivandrum", time: "6h ago" },
  { text: "New client onboarding in Thrissur", time: "8h ago" }
]

export default function RecentActivities() {
  return (
    <Card className="p-2 sm:p-4 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm rounded-xl min-h-[250px] h-auto col-span-full sm:col-span-2 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-[#004d6d]/10">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#004d6d]-600" />
          </div>
          <h3 className="text-sm sm:text-md font-semibold text-gray-800">Recent Activities</h3>
        </div>
      </div>
      <div className="space-y-1 sm:space-y-2">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3 text-sm p-1.5 sm:p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            <div className="flex-1 flex items-center justify-between flex-wrap sm:flex-nowrap">
              <p className="text-gray-800 text-xs sm:text-sm font-medium mr-1">{activity.text}</p>
              <p className="text-gray-400 text-[10px] sm:text-xs ml-auto">{activity.time}</p>
            </div>
          </div>
        ))}
        <div className="text-center mt-2 sm:mt-4">
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium py-1">View More</button>
        </div>
      </div>
    </Card>
  )
}
