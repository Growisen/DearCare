import React, { memo } from "react"
import { Eye } from "lucide-react"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { formatDate, formatName, getServiceLabel } from "@/utils/formatters"
import { serviceOptions } from "@/utils/constants"
import { Client, ClientFilters } from "@/types/client.types"

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
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-6 text-gray-800 font-medium">{formatName(client.name)}</td>
      <td className="py-4 px-6 text-gray-600">{formatDate(client.requestDate)}</td>
      <td className="py-4 px-6 text-gray-600">{getServiceLabel(serviceOptions, client.service || '')}</td>
      <td className="py-4 px-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
        </span>
      </td>
      <td className="py-4 px-6">
        <div>
          <div className="text-gray-800">{client.email}</div>
          <div className="text-gray-500">{client.phone}</div>
        </div>
      </td>
      <td className="py-4 px-6">
        <button 
          className="px-3.5 py-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium inline-flex items-center gap-1.5"
          onClick={() => onReviewDetails(client)}
          aria-label={`Review details for ${client.name}`}
        >
          <Eye className="h-4 w-4" />
          Review Details
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
  
  return (
    <div className="p-5 space-y-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{formatName(client.name)}</h3>
          <p className="text-sm text-gray-500 mt-1">{getServiceLabel(serviceOptions, client.service || '')}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm bg-white border border-gray-200 p-3 rounded-lg">
        <p className="text-gray-500">Request Date:</p>
        <p className="text-gray-800 font-medium">{formatDate(client.requestDate)}</p>
        <p className="text-gray-500">Email:</p>
        <p className="text-gray-800 break-all">{client.email}</p>
        <p className="text-gray-500">Phone:</p>
        <p className="text-gray-800">{client.phone}</p>
      </div>
      
      <button 
        className="w-full px-4 py-2.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
        onClick={() => onReviewDetails(client)}
        aria-label={`Review details for ${client.name}`}
      >
        <Eye className="h-4 w-4" />
        Review Details
      </button>
    </div>
  );
});
ClientMobileCard.displayName = 'ClientMobileCard';

export const ClientTable = memo(function ClientTable({ clients, onReviewDetails }: ClientTableProps) {
  const statusColors: Record<ClientFilters, string> = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    under_review: "bg-blue-50 text-blue-700 border border-blue-200",
    approved: "bg-green-50 text-green-700 border border-green-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
    assigned: "bg-green-100 text-green-700 border border-green-200",
    all: "bg-gray-50 text-gray-600 border border-gray-200"
  }

  const statusIcons: Record<ClientFilters, React.FC<{ className?: string }>> = {
    pending: Clock,
    under_review: Eye,
    approved: CheckCircle,
    rejected: AlertCircle,
    assigned: CheckCircle,
    all: Eye
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr className="text-left">
              <th className="py-4 px-6 font-medium text-gray-700">Client Name</th>
              <th className="py-4 px-6 font-medium text-gray-700">Request Date</th>
              <th className="py-4 px-6 font-medium text-gray-700">Service</th>
              <th className="py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="py-4 px-6 font-medium text-gray-700">Contact</th>
              <th className="py-4 px-6 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
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
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No client requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden bg-white">
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
          <div className="p-8 text-center text-gray-500">
            No client requests found
          </div>
        )}
      </div>
    </div>
  )
});