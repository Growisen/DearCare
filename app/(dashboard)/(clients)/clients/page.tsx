"use client"
import { useState, useEffect } from "react"
import { Search, Eye, CheckCircle, Clock, AlertCircle, X } from "lucide-react"
import { Input } from "../../../../components/ui/input"
import { ClientDetailsOverlay } from "../../../../components/client-details-overlay"
import { AddClientOverlay } from "../../../../components/add-client-overlay"
import { getClients, exportClients } from "../../../../app/actions/client-actions"
import { Client } from '../../../../types/client.types'
import Loader from '@/components/loader'

export default function ClientsPage() {
  const [searchInput, setSearchInput] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "under_review" | "approved" | "rejected" | "assigned" | "all">("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddClient, setShowAddClient] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0) 
  const [isStatusLoaded, setIsStatusLoaded] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

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

  const handleSearch = () => {
    setCurrentPage(1) 
    setSearchQuery(searchInput)
  }

  useEffect(() => {
    if (!isStatusLoaded) return;
    
    async function loadClients() {
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await getClients(selectedStatus, searchQuery, currentPage, pageSize)
        
        if (result.success && result.clients) {
          // Add type assertion to make sure the status is of the correct type
          const typedClients = result.clients.map(client => ({
            ...client,
            service: client.service || "Not specified",
            email: client.email || "No email provided",
            phone: client.phone || "No phone provided",
            location: client.location || "No location specified",
            status: client.status as "pending" | "under_review" | "approved" | "rejected" | "assigned"
          }))
          setClients(typedClients)
          
          // Set pagination data
          if (result.pagination) {
            setTotalPages(result.pagination.totalPages)
            setTotalCount(result.pagination.totalCount)
          }
        } else {
          setError(result.error || "Failed to load clients")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadClients()
  }, [selectedStatus, searchQuery, refreshTrigger, isStatusLoaded, currentPage, pageSize])

  //load status from localStorage after initial render
  useEffect(() => {
    const saved = localStorage.getItem('clientsPageStatus');
    if (saved && ["pending", "under_review", "approved", "rejected", "assigned", "all"].includes(saved)) {
      setSelectedStatus(saved as "pending" | "under_review" | "approved" | "rejected" | "assigned" | "all");
    }
    setIsStatusLoaded(true); 
  }, []); 

  const filteredClients = clients

  const handleReviewDetails = (client: Client) => {
    setSelectedClient(client)
  }

  const handleClientAdded = () => {
    setShowAddClient(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleStatusChange = (status: "pending" | "under_review" | "approved" | "rejected" | "assigned" | "all") => {
    setCurrentPage(1) 
    setSelectedStatus(status);
    localStorage.setItem('clientsPageStatus', status);
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // function to handle client status change
  const handleClientStatusChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-6 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {clients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} clients
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`rounded-lg border p-2 ${
            currentPage === 1
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Determine which pages to show
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={i}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`rounded-lg border p-2 ${
            currentPage === totalPages
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )


  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const result = await exportClients(selectedStatus, searchQuery);
      
      if (!result.success || !result.clients || result.clients.length === 0) {
        alert('No clients found to export');
        setIsLoading(false);
        return;
      }
      
      const headers = ['Name', 'Request Date', 'Service', 'Status', 'Email', 'Phone', 'Location'];

      const csvRows = [
        headers.join(','),
        ...result.clients.map(client => [
          client.name?.replace(/,/g, ' ') || 'Unknown',
          client.requestDate || '',
          client.service?.replace(/,/g, ' ') || '',
          client.status?.replace(/_/g, ' ') || '',
          client.email?.replace(/,/g, ' ') || '',
          client.phone?.replace(/,/g, ' ') || '',
          client.location?.replace(/,/g, ' ') || ''
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `clients_export_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting clients:', error);
      alert('Failed to export clients');
    } finally {
      setIsExporting(false);
    }
  };

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
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </span>
              ) : (
                `Export ${selectedStatus === "all" ? "All" : 
                  selectedStatus.charAt(0).toUpperCase() + 
                  selectedStatus.slice(1).replace("_", " ")}`
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="relative w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                className="pl-10 w-full bg-white text-base text-gray-900 placeholder:text-gray-500 border-gray-200"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
              {/* Search button */}
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
              >
                Search
              </button>
              {searchInput && (
                <button 
                  onClick={() => {
                    setSearchInput("")
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          {/* Desktop view buttons */}
          <div className="hidden sm:block overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {["approved", "pending", "under_review", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as "pending" | "under_review" | "approved" | "rejected" | "assigned" | "all")}
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
              onChange={(e) => handleStatusChange(e.target.value as "pending" | "under_review" | "approved" | "rejected" | "assigned" | "all")}
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
          {isLoading ? (
            <Loader />
            ) : error ? (
              <div className="p-6 text-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center">
                <div className="bg-gray-50 border border-gray-200 text-gray-600 px-6 py-5 rounded-lg">
                  <p className="text-lg font-medium mb-1">No clients found</p>
                  <p className="text-sm">Try changing your filters or search criteria</p>
                </div>
              </div>
            ) : (
            <>
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

                {!isLoading && !error && filteredClients.length > 0 && (
                  <PaginationControls />
                )}
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

                {!isLoading && !error && filteredClients.length > 0 && (
                  <PaginationControls />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Client Overlay */}
      {showAddClient && (
        <AddClientOverlay 
          onClose={() => setShowAddClient(false)}
          onAdd={handleClientAdded}
        />
      )}

      {/* Render the overlay when a client is selected */}
      {selectedClient && (
        <ClientDetailsOverlay 
          client={selectedClient} 
          onClose={() => setSelectedClient(null)}
          onStatusChange={handleClientStatusChange}
        />
      )}
    </div>
  )
}
