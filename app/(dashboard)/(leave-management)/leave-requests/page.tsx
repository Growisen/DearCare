"use client"

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import LeaveRequestModal from '@/components/leaveManagement/LeaveRequestModal'
import StatusBadge from '@/components/leaveManagement/StatusBadge'
import { getLeaveRequests, updateLeaveRequestStatus } from '@/app/actions/leave-management'
import { toast } from 'react-hot-toast'
import { LeaveRequest, LeaveRequestStatus } from '@/types/leave.types'

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null)
  
  // Status options for filter
  const statuses = ['All', 'Approved', 'Pending', 'Rejected']

  // Handle view leave request
  const handleViewLeaveRequest = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request)
    setIsModalOpen(true)
  }

  // Handle approve leave request
  const handleApproveLeaveRequest = async (id: string) => {
    console.log("hhjhj")
    try {
      const result = await updateLeaveRequestStatus(id, 'approved')
      if (result.success) {
        toast.success('Leave request approved')
        // Update the local state
        setLeaveRequests(prev => 
          prev.map(req => req.id === id ? {...req, status: 'approved'} : req)
        )
        if (selectedLeaveRequest?.id === id) {
          setSelectedLeaveRequest({...selectedLeaveRequest, status: 'approved'})
        }
      } else {
        toast.error(result.error || 'Failed to approve leave request')
      }
    } catch {
      toast.error('An error occurred while approving the request')
    }
  }

  // Handle reject leave request
  const handleRejectLeaveRequest = async (id: string, rejectionReason?: string) => {
    try {
      // Only proceed with rejection if there's a reason
      if (!rejectionReason?.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      
      const result = await updateLeaveRequestStatus(id, 'rejected', rejectionReason)
      if (result.success) {
        toast.success('Leave request rejected')
        // Update the local state
        setLeaveRequests(prev => 
          prev.map(req => req.id === id ? 
            {...req, status: 'rejected', rejectionReason} : req)
        )
        if (selectedLeaveRequest?.id === id) {
          setSelectedLeaveRequest({
            ...selectedLeaveRequest, 
            status: 'rejected', 
            rejectionReason
          })
        }
      } else {
        toast.error(result.error || 'Failed to reject leave request')
      }
    } catch {
      toast.error('An error occurred while rejecting the request')
    }
  }

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    setIsLoading(true)
    try {
      let status: LeaveRequestStatus | null = null;
      
      if (statusFilter && statusFilter !== 'All') {
        const lowercaseStatus = statusFilter.toLowerCase() as LeaveRequestStatus;
        if (lowercaseStatus === 'pending' || lowercaseStatus === 'approved' || lowercaseStatus === 'rejected') {
          status = lowercaseStatus;
        }
      }
        
      const result = await getLeaveRequests(status, searchTerm)

      console.log(result)
      if (result.success) {
        setLeaveRequests(result.leaveRequests || [])
      } else {
        toast.error(result.error || 'Failed to fetch leave requests')
        setLeaveRequests([])
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      toast.error('An error occurred while fetching leave requests')
      setLeaveRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveRequests()
  }, [statusFilter, searchTerm])

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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative inline-block">
              <Filter className="absolute w-4 h-4 left-3 top-2.5 text-gray-500" />
              <select
                className="appearance-none pl-9 pr-8 py-2 border border-gray-300 bg-white rounded-md text-sm text-gray-900"
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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                    No leave requests found matching your search criteria.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.nurseName}</div>
                          <div className="text-sm text-gray-500">{request.nurseId}</div>
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
                        {format(parseISO(request.startDate), 'MMM dd, yyyy')} 
                        {request.startDate !== request.endDate && 
                          ` - ${format(parseISO(request.endDate), 'MMM dd, yyyy')}`}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.days}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(parseISO(request.appliedOn), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleViewLeaveRequest(request)}
                      >
                        View
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button 
                            className="text-green-600 hover:text-green-900 mr-3"
                            onClick={() => handleApproveLeaveRequest(request.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              setSelectedLeaveRequest(request);
                              setIsModalOpen(true);
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-right sm:px-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{leaveRequests.length}</span> results
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      {selectedLeaveRequest && (
        <LeaveRequestModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          leaveRequest={selectedLeaveRequest}
          onApprove={handleApproveLeaveRequest}
          onReject={handleRejectLeaveRequest}
        />
      )}
    </div>
  )
}