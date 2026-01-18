import React, { memo } from "react"
import { Eye, CheckCircle, Clock, AlertCircle, ArrowUpRight } from "lucide-react"
import { formatDate, formatName, getServiceLabel } from "@/utils/formatters"
import { serviceOptions } from "@/utils/constants"
import { Client, ClientFilters } from "@/types/client.types"
import { getExperienceFromJoiningDate, formatDateToDDMMYYYY } from "@/utils/dateUtils";
import Link from "next/link";

type ClientTableProps = {
  clients: Client[]
  onReviewDetails: (client: Client) => void
}

const ClientTableRow = memo(({ client, onReviewDetails, statusColors, statusIcons }: { 
  client: Client, 
  onReviewDetails: (client: Client) => void,
  statusColors: Record<ClientFilters, string>,
  statusIcons: Record<ClientFilters, React.FC<{ className?: string }>>
}) => {
  const status = client.status as ClientFilters;
  const StatusIcon = statusIcons[status];

  const createdAt = client.createdAt ?? '';
  const isNewClient = createdAt
    ? (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24) < 7
    : false;

  const daysSinceJoined = createdAt
    ? getExperienceFromJoiningDate(formatDateToDDMMYYYY(createdAt))
    : null;

  const clientProfileUrl = `/client-profile/${client.id}`;

  return (
    <tr className="hover:bg-gray-50 border-b border-slate-200 last:border-0 transition-colors">
      <td className="py-3 px-6 text-gray-800 font-medium align-top min-w-[200px]">
        <Link
          href={clientProfileUrl}
          className="font-medium text-gray-700 hover:underline inline-flex items-center gap-1"
          target="_blank"
          prefetch={false}
          rel="noopener noreferrer"
        >
          {formatName(client.name)}
          <ArrowUpRight className="inline w-3.5 h-3.5 ml-1 text-blue-700" />
        </Link>
        {isNewClient && (
          <span className="block mt-1 px-1.5 py-0.5 max-w-fit bg-green-100 text-green-700 text-[10px] rounded-full font-semibold border border-green-300">
            ✨ New
          </span>
        )}
      </td>

      <td className="py-3 px-6 text-gray-600 align-top whitespace-nowrap">
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="block">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1.5">New:</span>
            <span className="font-medium text-gray-700">{client.registrationNumber || "-"}</span>
          </span>
          <span className="block">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1.5">Old:</span>
            <span>{client.previousRegistrationNumber || "-"}</span>
          </span>
        </div>
      </td>

      <td className="py-3 px-6 text-gray-600 align-top whitespace-nowrap">
        <div className="font-medium text-sm">{formatDate(createdAt)}</div>
        {daysSinceJoined !== null && (
          <span className="block text-[10px] text-gray-400 mt-0.5">
            {daysSinceJoined} ago
          </span>
        )}
      </td>

      <td className="py-3 px-6 text-gray-600 align-top min-w-[140px] text-sm">
        {getServiceLabel(serviceOptions, client.service || '')}
      </td>

      <td className="py-3 px-6 align-top whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[status]}`}>
          <StatusIcon className="w-3 h-3" />
          {status.replace("_", " ").toUpperCase()}
        </span>
      </td>

      <td className="py-3 px-6 align-top min-w-[180px]">
        <div className="flex flex-col gap-0.5">
          <div className="text-gray-800 text-sm font-medium">{client.email}</div>
          <div className="text-gray-500 text-xs">{client.phone}</div>
        </div>
      </td>

      <td className="py-3 px-6 align-top whitespace-nowrap sticky right-0 bg-white sm:static sm:bg-transparent shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] sm:shadow-none">
        <button 
          className="px-2.5 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-sm transition-colors text-xs font-semibold inline-flex items-center gap-1.5 border border-blue-100"
          onClick={() => onReviewDetails(client)}
          aria-label={`Review ${client.name}`}
        >
          <Eye className="h-3.5 w-3.5" />
          Review
        </button>
      </td>
    </tr>
  );
});
ClientTableRow.displayName = 'ClientTableRow';

const ClientMobileCard = memo(({ client, onReviewDetails, statusColors, statusIcons }: {
  client: Client, 
  onReviewDetails: (client: Client) => void,
  statusColors: Record<ClientFilters, string>,
  statusIcons: Record<ClientFilters, React.FC<{ className?: string }>>
}) => {
  const status = client.status as ClientFilters;
  const StatusIcon = statusIcons[status];
  
  const clientProfileUrl = `/client-profile/${client.id}`;

  return (
    <div className="p-4 space-y-3 hover:bg-gray-50 transition-colors border-b border-slate-200 last:border-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">
            <Link
              href={clientProfileUrl}
              prefetch={false}
              className="hover:underline inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {formatName(client.name)}
            </Link>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{getServiceLabel(serviceOptions, client.service || '')}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[status]}`}>
          <StatusIcon className="w-3 h-3" />
          {status.replace("_", " ").toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs bg-white border border-slate-200 p-3 rounded-sm shadow-none">
        <div className="col-span-2 sm:col-span-1">
           <span className="text-gray-400 uppercase tracking-wide mr-2">Created:</span>
           <span className="text-gray-800 font-medium">{formatDate(client.createdAt ?? '')}</span>
        </div>
        
        <div className="col-span-2 sm:col-span-1">
           <span className="text-gray-400 uppercase tracking-wide mr-2">Reg:</span>
           <span className="text-gray-800 font-medium">{client.registrationNumber || "-"}</span>
        </div>

        <div className="col-span-2 sm:col-span-1">
           <span className="text-gray-400 uppercase tracking-wide mr-2">Prev Reg:</span>
           <span className="text-gray-800 font-medium">{client.previousRegistrationNumber || "-"}</span>
        </div>

        <div className="col-span-2 pt-1 border-t border-gray-50 mt-1 flex flex-col gap-1">
           <div className="flex items-center gap-2">
             <span className="text-gray-400 uppercase w-10">Email:</span>
             <span className="text-gray-800 truncate">{client.email}</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-gray-400 uppercase w-10">Phone:</span>
             <span className="text-gray-800">{client.phone}</span>
           </div>
        </div>
      </div>
      
      <button 
        className="w-full px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-100"
        onClick={() => onReviewDetails(client)}
      >
        <Eye className="h-3.5 w-3.5" />
        Review
      </button>
    </div>
  );
});
ClientMobileCard.displayName = 'ClientMobileCard';

export const ClientTable = memo(function ClientTable({ clients, onReviewDetails }: ClientTableProps) {
  const statusColors: Record<ClientFilters, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    under_review: "bg-blue-50 text-blue-700 border-blue-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    assigned: "bg-green-100 text-green-700 border-green-200",
    all: "bg-gray-50 text-gray-600 border-slate-200"
  }

  const statusIcons: Record<ClientFilters, React.FC<{ className?: string }>> = {
    pending: Clock,
    under_review: Eye,
    approved: CheckCircle,
    rejected: AlertCircle,
    assigned: CheckCircle,
    all: Eye
  }

  const thClass = "py-5 px-6 text-left text-sm font-medium text-gray-700 tracking-wider whitespace-nowrap";

  return (
    <div className="bg-white rounded-sm border border-slate-200 shadow-none overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-100 border-b border-slate-200">
            <tr>
              <th className={`${thClass} min-w-[180px]`}>Client Name</th>
              <th className={`${thClass} min-w-[140px]`}>Reg No</th>
              <th className={`${thClass} min-w-[130px]`}>Created At</th>
              <th className={`${thClass} min-w-[140px]`}>Service</th>
              <th className={`${thClass} min-w-[110px]`}>Status</th>
              <th className={`${thClass} min-w-[180px]`}>Contact</th>
              <th className={`${thClass} w-[100px] sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {clients.length > 0 ? (
              clients.map((client) => (
                <ClientTableRow 
                  key={client.id} 
                  client={client}
                  onReviewDetails={onReviewDetails}
                  statusColors={statusColors}
                  statusIcons={statusIcons}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-gray-300" />
                    <p className="text-sm">No client requests found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden bg-white">
        {clients.length > 0 ? (
          clients.map((client) => (
            <ClientMobileCard
              key={client.id}
              client={client}
              onReviewDetails={onReviewDetails}
              statusColors={statusColors}
              statusIcons={statusIcons}
            />
          ))
        ) : (
          <div className="p-12 text-center text-gray-500">
             <div className="flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-8 w-8 text-gray-300" />
                <p className="text-sm">No client requests found</p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
});