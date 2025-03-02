import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, Search, Download, MoreVertical, Mail, Phone } from "lucide-react"
import { Client } from "../../types/client.types"

const recentClients: Client[] = [
  { id: "1", name: "Anoop Kumar", requestDate: "2024-01-15", service: "Home Care", status: "pending", email: "anoop@example.com", phone: "944-756-7890" },
  { id: "2", name: "Priya Thomas", requestDate: "2024-01-14", service: "Elder Care", status: "under_review", email: "priya@example.com", phone: "855-654-3210" },
  { id: "3", name: "Mohammed Rashid", requestDate: "2024-01-13", service: "Post-Surgery Care", status: "approved", email: "rashid@example.com", phone: "944-789-0123" },
  { id: "4", name: "Lakshmi Menon", requestDate: "2024-01-12", service: "Home Care", status: "rejected", email: "lakshmi@example.com", phone: "934-123-4560" },
  { id: "5", name: "Rajesh Nair", requestDate: "2024-01-11", service: "Physiotherapy", status: "approved", email: "rajesh@example.com", phone: "944-654-0987" },
];

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

const formatStatus = (status: string) => status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")

export default function RecentClients() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClients = recentClients.filter(client =>
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
    <Card className="p-6 bg-white/50 backdrop-blur-sm border border-gray-100/20 rounded-xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-md font-semibold text-gray-800">Recent Clients</h3>
        </div>
        <div className="flex flex-col w-full sm:flex-row sm:w-auto items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-48 md:w-64">
            <Search className="w-3 h-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <table className="hidden sm:table w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              {['Client Name', 'Request Date', 'Service', 'Status', 'Contact', ''].map((header) => (
                <th key={header} className="py-3 px-4 text-sm font-semibold text-gray-600">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-800">{client.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{client.requestDate}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{client.service}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(client.status)}`}>
                    {formatStatus(client.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{client.email}</div>
                    <div className="text-gray-600">{client.phone}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="p-4 rounded-lg border border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-gray-800">{client.name}</h4>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(client.status)}`}>
                      {formatStatus(client.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{client.service}</p>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 ml-2">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <div className="text-gray-600 mb-1">Request Date</div>
                  <div className="font-medium">{client.requestDate}</div>
                </div>
                <div className="col-span-2 border-t border-gray-100 pt-3 mt-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-gray-900">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-4">
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">View More</button>
      </div>
    </Card>
  )
}