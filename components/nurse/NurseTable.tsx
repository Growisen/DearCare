import { CheckCircle, CalendarX, AlertCircle, Clock, FileClock, XCircle, Eye, MapPin } from "lucide-react"
import { NurseBasicDetails } from "@/types/staff.types"
import Loader from '@/components/Loader'
import { formatName } from "@/utils/formatters"

const statusColors = {
  assigned: "bg-green-200 text-green-800 border border-green-300",
  leave: "bg-yellow-200 text-yellow-800 border border-yellow-300",
  unassigned: "bg-purple-200 text-purple-800 border border-purple-300",
  pending: "bg-gray-200 text-gray-800 border border-gray-300",
  under_review: "bg-blue-200 text-blue-800 border border-blue-300",
  rejected: "bg-red-200 text-red-800 border border-red-300"
}

const statusIcons = {
  assigned: CheckCircle,
  leave: CalendarX,
  unassigned: AlertCircle,
  pending: Clock,
  under_review: FileClock,
  rejected: XCircle
}

interface NurseTableProps {
  nurses: NurseBasicDetails[];
  isLoading?: boolean;
}

const NurseTable = ({ 
  nurses,  
  isLoading = false
}: NurseTableProps) => {

  if (isLoading) {
    return <Loader />;
  }

  const thClass = "py-3 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className={`${thClass} min-w-[200px]`}>Nurse Name</th>
              <th className={`${thClass} min-w-[140px]`}>Reg No</th>
              {/* <th className={`${thClass} min-w-[120px]`}>Status</th> */}
              <th className={`${thClass} min-w-[100px]`}>Experience</th>
              <th className={`${thClass} min-w-[100px]`}>Rating</th>
              <th className={`${thClass} min-w-[180px]`}>Location</th> 
              <th className={`${thClass} min-w-[200px]`}>Contact</th>
              <th className={`${thClass} w-[100px] sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {nurses.map((nurse) => {
              const StatusIcon = statusIcons[nurse.status as keyof typeof statusIcons]
              return (
                <tr key={nurse.nurse_id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
                  <td className="py-3 px-6 text-gray-900 font-medium align-top min-w-[200px]">
                    <div>
                      {`${formatName(nurse.name.first || "")} ${formatName(nurse.name.last || "")}`}
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            statusColors[nurse.status as keyof typeof statusColors]
                          }`}
                        >
                          {StatusIcon && <StatusIcon className="w-3 h-3" />}
                          {nurse.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-6 text-gray-600 align-top whitespace-nowrap">
                    <div className="flex flex-col gap-0.5 text-sm">
                      <span className="block">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1.5">New:</span>
                        <span className="font-medium text-gray-700">{nurse.regno || "-"}</span>
                      </span>
                      <span className="block">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1.5">Old:</span>
                        <span>{nurse.previous_regno || "-"}</span>
                      </span>
                    </div>
                  </td>

                  {/* <td className="py-3 px-6 align-top whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        statusColors[nurse.status as keyof typeof statusColors]
                      }`}
                    >
                      {StatusIcon && <StatusIcon className="w-3 h-3" />}
                      {nurse.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td> */}

                  <td className="py-3 px-6 text-gray-700 align-top text-sm">
                    {nurse.experience || 0} years
                  </td>

                  <td className="py-3 px-6 text-gray-700 align-top text-sm">
                    {nurse.rating || 0}/5
                  </td>

                  <td className="py-3 px-6 align-top min-w-[180px]">
                    <div className="flex flex-col gap-0.5">
                      {(nurse.city || nurse.taluk) && (
                        <div className="text-gray-900 text-sm font-medium flex items-center gap-1.5">
                          <span>
                            {[nurse.city, nurse.taluk].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      {nurse.address && (
                        <div
                          className="text-gray-800 text-xs max-w-[170px] break-words whitespace-pre-line"
                          style={{ overflowWrap: "anywhere" }}
                          title={nurse.address}
                        >
                          {nurse.address.replace(/, /g, ",\u200B")}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-6 align-top min-w-[200px]">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-gray-900 text-sm font-medium">{nurse.contact.email}</div>
                      <div className="text-gray-600 text-xs">{nurse.contact.phone}</div>
                    </div>
                  </td>

                  <td className="py-3 px-6 align-top whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                    <a
                      href={`/nurses/${nurse.nurse_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors text-xs font-semibold inline-flex items-center gap-1.5 border border-blue-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Review
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NurseTable