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
    <Card className="p-4 bg-white/50 backdrop-blur-sm border border-gray-100/20 rounded-xl h-[290px] col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#004d6d]/10">
            <Activity className="w-5 h-5 text-[#004d6d]-600" />
          </div>
          <h3 className="text-md font-semibold text-gray-800">Recent Activities</h3>
        </div>
      </div>
      <div className="space-y-2">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <div className="flex-1 flex items-center justify-between">
              <p className="text-gray-800 text-sm font-medium">{activity.text}</p>
              <p className="text-gray-400 text-xs">{activity.time}</p>
            </div>
          </div>
        ))}
        <div className="text-center mt-4">
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">View More</button>
        </div>
      </div>
    </Card>
  )
}
