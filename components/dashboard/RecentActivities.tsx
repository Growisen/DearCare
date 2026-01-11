import { Card } from "../ui/card"
import { AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

interface ComplaintsData {
  open: number;
  underReview: number;
  resolved: number;
  total: number;
}

interface ComplaintsStatsProps {
  complaintsData?: ComplaintsData;
  isLoading?: boolean;
}

export default function ComplaintsStats({ complaintsData, isLoading = false }: ComplaintsStatsProps) {
  const stats = complaintsData || { open: 0, underReview: 0, resolved: 0, total: 0 }

  const complaintItems = [
    { 
      label: "Open Complaints", 
      count: stats.open, 
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      percentage: stats.total ? Math.round((stats.open / stats.total) * 100) : 0,
      color: "bg-amber-600"
    },
    { 
      label: "Under Review", 
      count: stats.underReview, 
      icon: <XCircle className="w-4 h-4 text-indigo-600" />,
      percentage: stats.total ? Math.round((stats.underReview / stats.total) * 100) : 0,
      color: "bg-indigo-600"
    },
    { 
      label: "Resolved", 
      count: stats.resolved, 
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      percentage: stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0,
      color: "bg-emerald-600"
    },
    { 
      label: "Total", 
      count: stats.total, 
      icon: <AlertTriangle className="w-4 h-4 text-slate-700" />,
      percentage: 100,
      color: "bg-slate-700"
    }
  ]

  return (
    <Card className="p-3 sm:p-4 bg-white border border-slate-200 shadow-none rounded-sm col-span-full sm:col-span-2">
      <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center sm:items-center justify-between mb-3 sm:mb-4 border-b border-slate-200 pb-2">
        <div className="flex items-center mb-2 xs:mb-0 sm:mb-0">
          <AlertTriangle className="w-5 h-5 text-slate-700 mr-2" />
          <h3 className="text-sm sm:text-md font-medium text-slate-800">Complaints Overview</h3>
        </div>
        <Link 
          href="/complaints" 
          className={`text-xs font-medium text-blue-600 hover:text-blue-800 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
        >
          View details →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
        {complaintItems.map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-sm p-2 sm:p-3 shadow-none">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              {item.icon}
              <span className="text-xs sm:text-sm font-medium text-slate-800">{item.label}</span>
            </div>
            
            <div className="flex items-baseline justify-between mb-1 h-7">
              {isLoading ? (
                <>
                  <div className="h-6 w-12 bg-slate-200 rounded-sm animate-pulse" />
                  <div className="h-4 w-8 bg-slate-200 rounded-sm animate-pulse" />
                </>
              ) : (
                <>
                  <span className="text-base sm:text-lg font-semibold text-slate-900">{item.count}</span>
                  <span className="text-xs text-slate-600">{item.percentage}%</span>
                </>
              )}
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              {isLoading ? (
                <div className="h-full w-full bg-slate-200 animate-pulse" />
              ) : (
                <div 
                  className={`${item.color} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}