import { Card } from "../ui/card"
import { Calendar } from "lucide-react"

interface Schedule {
  text: string;
  time: string;
  location: string;
  urgent?: boolean;
}

const schedules = [
    { text: "Team Meeting", time: "2:00 PM", location: "Room A", urgent: true },
    { text: "Client Review", time: "4:30 PM", location: "Virtual" },
    { text: "New Hire Orientation", time: "Tomorrow, 10 AM", location: "Training" },
    { text: "Monthly Report Due", time: "Friday", location: "Docs" },
]

export default function UpcomingSchedules() {
  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm border border-gray-100/20 rounded-xl h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-amber-100">
          <Calendar className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="text-md font-semibold text-gray-800">Upcoming Schedules</h3>
      </div>
      <div className="space-y-3 overflow-y-auto custom-scrollbar h-[320px]">
        {schedules.map((schedule, i) => (
          <div key={i} className="p-3 rounded-xl bg-blue-50/30 hover:bg-blue-50/50 transition-colors border border-blue-100/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-sm font-medium flex items-center gap-2">
                  {schedule.text}
                  {schedule.urgent && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-100/50 text-rose-600 text-xs">
                      Urgent
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 ml-11">
              <span>{schedule.time}</span>
              <div className="flex items-center gap-1">
                <span>•</span>
                <span>{schedule.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
