import { Card } from "../ui/card"
import { MdOutlineReportProblem } from "react-icons/md"
import { 
  BiSolidTimeFive, 
  BiSolidCheckCircle, 
  BiSolidXCircle 
} from "react-icons/bi"
import { useEffect, useState } from "react"

interface ComplaintsData {
  open: number;
  underReview: number;
  resolved: number;
  total: number;
}

interface ComplaintsStatsProps {
  complaintsData?: ComplaintsData;
}

export default function ComplaintsStats({ complaintsData }: ComplaintsStatsProps) {
  const [stats, setStats] = useState({
    open: 0,
    underReview: 0,
    resolved: 0,
    total: 0
  })
  
  useEffect(() => {
    if(complaintsData) {
      setStats(complaintsData)
    }
  }, [complaintsData])

  const complaintItems = [
    { 
      label: "Open Complaints", 
      count: stats.open, 
      icon: <BiSolidTimeFive className="w-4 h-4 text-gray-600" />,
      percentage: stats.total ? Math.round((stats.open / stats.total) * 100) : 0
    },
    { 
      label: "Under Review", 
      count: stats.underReview, 
      icon: <BiSolidXCircle className="w-4 h-4 text-gray-600" />,
      percentage: stats.total ? Math.round((stats.underReview / stats.total) * 100) : 0
    },
    { 
      label: "Resolved", 
      count: stats.resolved, 
      icon: <BiSolidCheckCircle className="w-4 h-4 text-gray-600" />,
      percentage: stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0
    },
    { 
      label: "Total", 
      count: stats.total, 
      icon: <MdOutlineReportProblem className="w-4 h-4 text-gray-600" />,
      percentage: 100
    }
  ]

  return (
    <Card className="p-4 bg-white border border-gray-200 shadow-sm rounded-lg col-span-full sm:col-span-2">
      <div className="flex items-center mb-4 border-b border-gray-100 pb-2">
        <MdOutlineReportProblem className="w-5 h-5 text-gray-700 mr-2" />
        <h3 className="text-md font-medium text-gray-800">Complaints Overview</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {complaintItems.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-lg font-semibold text-gray-800">{item.count}</span>
              <span className="text-xs text-gray-500">{item.percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-gray-600 h-1.5 rounded-full" 
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}