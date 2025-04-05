"use client"

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown} from 'lucide-react'
import { format } from 'date-fns'
import LeaveRequestModal from '@/components/leaveManagement/LeaveRequestModal'
import StatusBadge from '@/components/leaveManagement/StatusBadge'
// Mock data - replace with actual API call
const mockLeaveRequests = [
  {
    id: '1',
    employeeName: 'John Doe',
    employeeId: 'EMP001',
    department: 'Engineering',
    leaveType: 'Sick Leave',
    startDate: new Date('2025-04-10'),
    endDate: new Date('2025-04-12'),
    days: 3,
    leaveMode: 'Full Day',
    reason: 'Medical appointment',
    status: 'Approved',
    appliedOn: new Date('2025-04-01'),
  },
  {
    id: '2',
    employeeName: 'Jane Smith',
    employeeId: 'EMP002',
    department: 'Marketing',
    leaveType: 'Annual Leave',
    startDate: new Date('2025-04-15'),
    endDate: new Date('2025-04-20'),
    days: 6,
    leaveMode: 'Full Day',
    reason: 'Family vacation',
    status: 'Pending',
    appliedOn: new Date('2025-04-02'),
  },
  {
    id: '3',
    employeeName: 'Mike Johnson',
    employeeId: 'EMP003',
    department: 'Finance',
    leaveType: 'Personal Leave',
    startDate: new Date('2025-04-08'),
    endDate: new Date('2025-04-09'),
    days: 2,
    leaveMode: 'Half Day (Morning)',
    reason: 'Personal matters',
    status: 'Rejected',
    appliedOn: new Date('2025-03-28'),
  },
  {
    id: '4',
    employeeName: 'Sarah Williams',
    employeeId: 'EMP004',
    department: 'HR',
    leaveType: 'Casual Leave',
    startDate: new Date('2025-04-05'),
    endDate: new Date('2025-04-05'),
    days: 0.5,
    leaveMode: 'Half Day (Afternoon)',
    reason: 'Doctor appointment',
    status: 'Approved',
    appliedOn: new Date('2025-03-30'),
  },
]


export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<typeof mockLeaveRequests[0] | null>(null)
  
  // Status options for filter
  const statuses = ['All', 'Approved', 'Pending', 'Rejected']

  // Handle view leave request
  const handleViewLeaveRequest = (id: string) => {
    const leaveRequest = leaveRequests.find(req => req.id === id)
    setSelectedLeaveRequest(leaveRequest || null)
    setIsModalOpen(true)
  }

  // Handle approve leave request
  const handleApproveLeaveRequest = (id: string) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === id ? {...req, status: 'Approved'} : req
      )
    )
  }

  // Handle reject leave request
  const handleRejectLeaveRequest = (id: string) => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === id ? {...req, status: 'Rejected'} : req
      )
    )
  }

  // Filtered data
  const filteredData = leaveRequests.filter(request => {
    const matchesSearch = 
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveMode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === null || statusFilter === 'All' || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // In a real app, fetch data here
  useEffect(() => {
    // Replace with actual API call
    // Example: fetchLeaveRequests().then(data => setLeaveRequests(data))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Leave Requests</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 w-full md:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, ID, leave type..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative inline-block">
              <Filter className="absolute w-4 h-4 left-3 top-2.5 text-gray-500" />
              <select
                className="appearance-none pl-9 pr-8 py-2 border border-gray-300 bg-white rounded-md text-sm"
                value={statusFilter || 'All'}
                onChange={(e) => setStatusFilter(e.target.value === 'All' ? null : e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Mode
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied On
                </th>
                <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                        <div className="text-sm text-gray-500">{request.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.leaveType}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.leaveMode}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(request.startDate, 'MMM dd, yyyy')} 
                      {request.startDate.getTime() !== request.endDate.getTime() && 
                        ` - ${format(request.endDate, 'MMM dd, yyyy')}`}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.days}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{format(request.appliedOn, 'MMM dd, yyyy')}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => handleViewLeaveRequest(request.id)}
                    >
                      View
                    </button>
                    {request.status === 'Pending' && (
                      <>
                        <button 
                          className="text-green-600 hover:text-green-900 mr-3"
                          onClick={() => handleApproveLeaveRequest(request.id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRejectLeaveRequest(request.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    No leave requests found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-right sm:px-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredData.length}</span> results
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leaveRequest={selectedLeaveRequest}
        onApprove={handleApproveLeaveRequest}
        onReject={handleRejectLeaveRequest}
      />
    </div>
  )
}