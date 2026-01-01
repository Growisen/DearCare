import React, { memo } from "react"
import { Eye, Clock, CheckCircle } from "lucide-react"
import { Complaint, ComplaintStatus } from "@/types/complaint.types"

type ComplaintTableProps = {
  complaints: Complaint[]
  onViewComplaint: (complaint: Complaint) => void
}

// Source badge component
const SourceBadge = ({ source }: { source: string }) => {
  const sourceConfig: Record<string, { classes: string }> = {
    client: {
      classes: "bg-purple-100 text-purple-700"
    },
    nurse: {
      classes: "bg-teal-100 text-teal-700"
    }
  };

  const { classes } = sourceConfig[source] || sourceConfig.client;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
      {source.charAt(0).toUpperCase() + source.slice(1)}
    </span>
  );
};

const ComplaintTableRow = memo(({ complaint, onViewComplaint, statusColors, statusIcons }: { 
  complaint: Complaint, 
  onViewComplaint: (complaint: Complaint) => void,
  statusColors: Record<ComplaintStatus, string>,
  statusIcons: Record<ComplaintStatus, React.FC<{ className?: string }>>
}) => {
  const status = complaint.status;
  const StatusIcon = statusIcons[status];
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-6">
        <div>
          <div className="text-gray-800 font-medium mb-1">{complaint.title}</div>
          <div className="text-gray-500 text-sm line-clamp-1">{complaint.description}</div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-col">
          <div className="text-gray-800">{complaint.submitterName}</div>
          <div className="flex gap-2 items-center text-sm text-gray-500">
            <SourceBadge source={complaint.source} />
          </div>
        </div>
      </td>
      <td className="py-4 px-6 text-gray-600">{complaint.submissionDate}</td>
     
      <td className="py-4 px-6">
        <button 
          className="px-3.5 py-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors text-sm font-medium inline-flex items-center gap-1.5"
          onClick={() => onViewComplaint(complaint)}
          aria-label={`View details for ${complaint.title}`}
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
      </td>
    </tr>
  );
});
ComplaintTableRow.displayName = 'ComplaintTableRow';

const ComplaintMobileCard = memo(({ complaint, onViewComplaint, statusColors, statusIcons }: {
  complaint: Complaint, 
  onViewComplaint: (complaint: Complaint) => void,
  statusColors: Record<ComplaintStatus, string>,
  statusIcons: Record<ComplaintStatus, React.FC<{ className?: string }>>
}) => {
  const status = complaint.status;
  const StatusIcon = statusIcons[status];
  
  return (
    <div className="p-5 space-y-4 hover:bg-gray-50 transition-colors border-b border-slate-200 last:border-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{complaint.title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <SourceBadge source={complaint.source} />
            <span className="text-sm text-gray-500">{complaint.submissionDate}</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm bg-white border border-slate-200 p-3 rounded-sm">
        <p className="text-gray-500">Submitted By:</p>
        <p className="text-gray-800 font-medium">{complaint.submitterName}</p>
      </div>
      
      <button 
        className="w-full px-4 py-2.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors text-sm font-medium flex items-center justify-center gap-2"
        onClick={() => onViewComplaint(complaint)}
        aria-label={`View details for ${complaint.title}`}
      >
        <Eye className="h-4 w-4" />
        View Details
      </button>
    </div>
  );
});
ComplaintMobileCard.displayName = 'ComplaintMobileCard';

export const ComplaintTable = memo(function ComplaintTable({ complaints, onViewComplaint }: ComplaintTableProps) {
  const statusColors: Record<ComplaintStatus, string> = {
    open: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    under_review: "bg-blue-50 text-blue-700 border border-blue-200",
    resolved: "bg-green-50 text-green-700 border border-green-200",
  }

  const statusIcons: Record<ComplaintStatus, React.FC<{ className?: string }>> = {
    open: Clock,
    under_review: Eye,
    resolved: CheckCircle,
  }

  return (
    <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-slate-200">
            <tr className="text-left">
              <th className="py-4 px-6 font-medium text-gray-700">Complaint</th>
              <th className="py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="py-4 px-6 font-medium text-gray-700">Submitted By</th>
              <th className="py-4 px-6 font-medium text-gray-700">Date</th>
              <th className="py-4 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {complaints.length > 0 ? (
              complaints.map((complaint) => (
                <ComplaintTableRow 
                  key={complaint.id} 
                  complaint={complaint}
                  onViewComplaint={onViewComplaint}
                  statusColors={statusColors}
                  statusIcons={statusIcons}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No complaints found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden bg-white">
        {complaints.length > 0 ? (
          complaints.map((complaint) => (
            <ComplaintMobileCard
              key={complaint.id}
              complaint={complaint}
              onViewComplaint={onViewComplaint}
              statusColors={statusColors}
              statusIcons={statusIcons}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No complaints found
          </div>
        )}
      </div>
    </div>
  )
});