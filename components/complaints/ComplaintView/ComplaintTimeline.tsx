import { Complaint } from "@/types/complaint.types";    

interface ComplaintTimelineProps {
  complaint: Complaint;
}

export default function ComplaintTimeline({ complaint }: ComplaintTimelineProps) {

  const statusHistory = complaint.statusHistory || [];

  console.log("resol", complaint)
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-3 text-gray-900">Complaint Timeline</h3>
      <div className="space-y-3">
        <div className="flex items-start">
          <div className="mr-3 bg-blue-100 rounded-full p-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Complaint Submitted</p>
            <span className="text-xs text-gray-500">{complaint.submissionDate}</span>
          </div>
        </div>
        
        {statusHistory.map((entry, index) => (
          <div className="flex items-start" key={`status-${index}`}>
            <div className="mr-3 bg-yellow-100 rounded-full p-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Status changed to: {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
              </p>
              <span className="text-xs text-gray-500">
                {new Date(entry.timestamp).toLocaleDateString()}
              </span>
              {entry.notes && (
                <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
              )}
            </div>
          </div>
        ))}
        
        {/* <div className="flex items-start">
          <div className="mr-3 bg-gray-100 rounded-full p-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Last Updated</p>
            <span className="text-xs text-gray-500">{complaint.lastUpdated}</span>
          </div>
        </div> */}
        
        {complaint.resolution && complaint.status === "resolved" && (
          <div className="flex items-start">
            <div className="mr-3 bg-green-100 rounded-full p-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Resolved</p>
              <span className="text-xs text-gray-800">
                {complaint.resolution.resolutionDate}
              </span>
              {complaint.resolution.resolutionNotes && (
                <p className="text-xs text-gray-600 mt-1">
                  {complaint.resolution.resolutionNotes}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}