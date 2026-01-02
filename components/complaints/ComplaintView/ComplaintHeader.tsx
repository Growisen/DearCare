import { Complaint, statusOptions, ComplaintStatus } from "@/types/complaint.types";

interface ComplaintHeaderProps {
  complaint: Complaint;
}

export default function ComplaintHeader({ complaint }: ComplaintHeaderProps) {
  const getStatusBadge = (status: ComplaintStatus) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOption?.color || "bg-gray-100"}`}>
        {statusOption?.label || status}
      </span>
    );
  };

  return (
    <div className="border-b p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <span>ID: {complaint.id}</span>
            <span>•</span>
            <span>Submitted: {complaint.submissionDate}</span>
            <span>•</span>
            <span>Last Updated: {complaint.lastUpdated}</span>
          </div>
          <div className="flex gap-2 mt-3">
            {getStatusBadge(complaint.status)}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              complaint.source === 'client' ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'
            }`}>
              {complaint.source === 'client' ? 'Client' : 'Nurse'}
            </span>
          </div>
        </div>
        <button 
          onClick={() => window.close()} 
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-sm cursor-pointer"
        >
          Close Window
        </button>
      </div>
    </div>
  );
}