import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Users, Search, Download, Mail, Phone, Eye, Clock } from "lucide-react"
import { Client } from "../../types/client.types"
import Link from "next/link"
import { serviceOptions } from "@/utils/constants"
import { getServiceLabel, formatDate, formatName } from "@/utils/formatters"


interface RecentClientsProps {
  clientsData?: Client[];
}

const getStatusStyles = (status: Client['status']) => {
  const styles = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    under_review: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    assigned: 'bg-purple-100 text-purple-700',
  }
  return styles[status] || 'bg-gray-100 text-gray-700'
}

const statusIcons = {
  pending: Clock,
  under_review: Eye,
  approved: Clock,
  rejected: Clock,
  assigned: Clock
}

const formatStatus = (status: string) => status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")

export default function RecentClients({ clientsData }: RecentClientsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clientsData) {
      const typedClients = clientsData.map(client => ({
        ...client,
        service: client.service || "Not specified",
        email: client.email || "No email provided",
        phone: client.phone || "No phone provided",
        location: client.location || "No location specified",
        status: client.status as "pending" | "under_review" | "approved" | "rejected" | "assigned"
      }));
      setClients(typedClients);
      setIsLoading(false);
    }
  }, [clientsData]);


  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Name,Request Date,Service,Status,Email,Phone"]
      .concat(filteredClients.map(client => 
        `${client.name},${client.requestDate},${client.service},${client.status},${client.email},${client.phone}`
      )).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "recent_clients.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="p-3 sm:p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
      <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center sm:items-center justify-between
       mb-3 sm:mb-4 border-b border-slate-200 pb-2"
      >
        <div className="flex items-center mb-2 xs:mb-0 sm:mb-0">
          <Users className="w-5 h-5 text-slate-700 mr-2" />
          <h3 className="text-sm sm:text-md font-medium text-slate-800">Recent Clients</h3>
        </div>
        <div className="flex flex-col w-full sm:flex-row sm:w-auto items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="pl-8 pr-3 py-1.5 sm:py-2 text-xs text-gray-800 sm:text-sm border border-slate-300
               rounded-sm focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium
             bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors shadow-sm"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-sm text-slate-600 mt-2">Loading clients...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-slate-50 border border-slate-200 text-slate-600 px-6 py-5 rounded-md">
              <p className="text-lg font-medium mb-1">No pending requests</p>
              <p className="text-sm">All client requests have been processed</p>
            </div>
          </div>
        ) : (
          <>
            <table className="hidden sm:table w-full">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Client Name</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Request Date</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Service</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const StatusIcon = statusIcons[client.status]
                  return (
                    <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-800">{formatName(client.name)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{formatDate(client.requestDate)}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{getServiceLabel(serviceOptions, client.service || "")}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(client.status)}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {formatStatus(client.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="text-slate-900">{client.email}</div>
                          <div className="text-slate-600">{client.phone}</div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="sm:hidden space-y-4">
              {filteredClients.map((client) => {
                const StatusIcon = statusIcons[client.status]
                return (
                  <div key={client.id} className="p-4 rounded-md border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-slate-800">{client.name}</h4>
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(client.status)}`}>
                            <StatusIcon className="inline w-3.5 h-3.5 mr-1" />
                            {formatStatus(client.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{getServiceLabel(serviceOptions, client.service || "")}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="col-span-2">
                        <div className="text-slate-600 mb-1">Request Date</div>
                        <div className="font-medium text-slate-700">{client.requestDate}</div>
                      </div>
                      <div className="col-span-2 border-t border-slate-100 pt-3 mt-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-600 overflow-hidden">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="text-slate-900 truncate overflow-hidden">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4" />
                            <span>{client.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      <div className="text-center mt-4">
        <Link 
          href="/clients" 
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
          onClick={() => localStorage.setItem('clientsPageStatus', 'pending')}
        >
          View All Client Requests →
        </Link>
      </div>
    </Card>
  )
}