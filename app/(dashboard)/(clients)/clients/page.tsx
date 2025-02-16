"use client"
import { useState } from "react"
import { Search, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Input } from "../../../../components/ui/input"
import { ClientDetailsOverlay } from "../../../../components/client-details-overlay"
import { AddClientOverlay } from "../../../../components/add-client-overlay"

interface Client {
  id: string
  name: string
  requestDate: string
  service: string
  status: "pending" | "under_review" | "approved" | "rejected"| "assigned"
  email: string
  phone: string
  location: string
  assignedNurse?: string 
  nurseContact?: string
  shift?: string
  condition?: string
  description?: string
  medications?: string[]
  specialInstructions?: string
  nurseLocation?: { lat: number; lng: number }
  clientLocation?: { lat: number; lng: number }
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Arun Kumar",
    requestDate: "2024-01-15",
    service: "Home Care",
    status: "pending",
    email: "arunkumar@gmail.com",
    phone: "9847123456",
    location: "Kottayam"
  },
  {
    id: "2",
    name: "Priya Menon",
    requestDate: "2024-01-14",
    service: "Elder Care",
    status: "under_review",
    email: "priyamenon@gmail.com",
    phone: "9745678901",
    location: "Kochi"
  },
  {
    id: "3",
    name: "Thomas George",
    requestDate: "2024-01-13",
    service: "Post-Surgery Care",
    status: "assigned",
    email: "thomasgeorge@gmail.com",
    phone: "9895234567",
    assignedNurse: "1", 
    nurseContact: "9876543210",
    shift: "Morning (8 AM - 4 PM)",
    condition: "Post Hip Surgery",
    description: "Patient requires assistance with mobility and physical therapy exercises",
    medications: ["Pain medication - 3 times daily", "Blood thinners - morning", "Antibiotics - twice daily"],
    specialInstructions: "Ensure patient does skip exercises twice daily. Monitor wound site for any signs of infection.",
    nurseLocation: { lat: 12.9716, lng: 77.5946 },
    clientLocation: { lat: 12.9352, lng: 77.6245 },
    location: "Malappuram"
  },
  {
    id: "4",
    name: "Lakshmi Nair",
    requestDate: "2024-01-12",
    service: "Home Care",
    status: "rejected",
    email: "lakshmink@gmail.com",
    phone: "9946789012",
    location: "Thiruvananthapuram"
  },
  {
    id: "5",
    name: "Mohammed Rashid",
    requestDate: "2024-01-15",
    service: "Elder Care",
    status: "pending",
    email: "rashidm@gmail.com",
    phone: "9847890123",
    location: "Kozhikode"
  },
  {
    id: "6",
    name: "Susan Philip",
    requestDate: "2024-01-11",
    service: "Physiotherapy",
    status: "approved",
    condition: "Post Hip Surgery",
    description: "Patient requires assistance with mobility and physical therapy exercises",
    email: "susanphilip@gmail.com",
    phone: "9947567890",
    location: "Kollam"
  },
  {
    id: "7",
    name: "Rajesh Krishnan",
    requestDate: "2024-01-10",
    service: "Home Care",
    status: "under_review",
    email: "rajeshk@gmail.com",
    phone: "9847345678",
    location: "Thrissur"
  },
  {
    id: "8",
    name: "Anjali Menon",
    requestDate: "2024-01-14",
    service: "Post-Surgery Care",
    status: "pending",
    email: "anjalim@gmail.com",
    phone: "9946234567",
    location: "Alappuzha"
  },
  {
    id: "9",
    name: "Joseph Mathew",
    requestDate: "2024-01-13",
    service: "Elder Care",
    status: "approved",
    description: "Patient requires assistance with mobility and physical therapy exercises",
    email: "josephm@gmail.com",
    phone: "9895678901",
    location: "Palakkad"
  },
  {
    id: "10",
    name: "Fathima Zahra",
    requestDate: "2024-01-12",
    service: "Physiotherapy",
    status: "under_review",
    email: "fathimaz@gmail.com",
    phone: "9847456789",
    location: "Kannur"
  }
]

export default function ClientsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddClient, setShowAddClient] = useState(false)

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    under_review: "bg-blue-100 text-blue-700 border border-blue-200",
    approved: "bg-green-100 text-green-700 border border-green-200",
    rejected: "bg-red-100 text-red-700 border border-red-200",
    assigned: "bg-green-300 text-green-700 border border-green-300"
  }

  const statusIcons = {
    pending: Clock,
    under_review: Eye,
    approved: CheckCircle,
    rejected: AlertCircle,
    assigned: CheckCircle
  }

  const filteredClients = mockClients.filter(client => {
    const matchesStatus = selectedStatus === "all" ? client.status === "approved" : client.status === selectedStatus
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleReviewDetails = (client: Client) => {
    setSelectedClient(client)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const handleAddClient = (clientData: any) => {
    // Handle adding new client here
    setShowAddClient(false)
  }

  return (
    <div>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Client Requests</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowAddClient(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Client
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Export
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              className="pl-10 w-full bg-white text-base text-gray-900 placeholder:text-gray-500 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Desktop view buttons */}
          <div className="hidden sm:block overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {["approved", "pending", "under_review", "rejected", "assigned"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedStatus === status
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          {/* Mobile view select */}
          <div className="sm:hidden">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-base text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1.5em 1.5em`,
                paddingRight: `2.5rem`
              }}
            >
              {["approved", "pending", "under_review", "rejected", "assigned"].map((status) => (
                <option key={status} value={status} className="py-2">
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left">
                  <th className="py-4 px-6 font-semibold text-gray-700">Client Name</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Request Date</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Service</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Contact</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const StatusIcon = statusIcons[client.status]
                  return (
                    <tr key={client.id} className="hover:bg-gray-50/50">
                      <td className="py-4 px-6 text-gray-900 font-medium">{client.name}</td>
                      <td className="py-4 px-6 text-gray-700">{client.requestDate}</td>
                      <td className="py-4 px-6 text-gray-700">{client.service}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[client.status]}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {client.status.replace("_", " ").charAt(0).toUpperCase() + client.status.slice(1).replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-gray-900">{client.email}</div>
                          <div className="text-gray-600">{client.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button 
                          className="px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                          onClick={() => handleReviewDetails(client)}
                        >
                          Review Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-gray-200">
            {filteredClients.map((client) => {
              const StatusIcon = statusIcons[client.status]
              return (
                <div key={client.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-600">{client.service}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[client.status]}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {client.status.replace("_", " ").charAt(0).toUpperCase() + client.status.slice(1).replace("_", " ")}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600">Request Date: {client.requestDate}</p>
                    <p className="text-gray-900">{client.email}</p>
                    <p className="text-gray-600">{client.phone}</p>
                  </div>
                  
                  <button 
                    className="w-full mt-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    onClick={() => handleReviewDetails(client)}
                  >
                    Review Details
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add Client Overlay */}
      {showAddClient && (
        <AddClientOverlay 
          onClose={() => setShowAddClient(false)}
          onAdd={handleAddClient}
        />
      )}

      {/* Render the overlay when a client is selected */}
      {selectedClient && (
        <ClientDetailsOverlay 
          client={selectedClient} 
          onClose={() => setSelectedClient(null)} 
        />
      )}
    </div>
  )
}
