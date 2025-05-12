"use client"

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, Calendar, Check, ArrowLeft, ArrowRight } from 'lucide-react'
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
  const [dateRange, setDateRange] = useState<{startDate: string | null, endDate: string | null}>({
    startDate: null,
    endDate: null
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  
  const [processingRequestIds, setProcessingRequestIds] = useState<Set<string>>(new Set())
  
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    requestId: string | null;
    action: 'approve' | 'reject' | null;
  }>({
    isOpen: false,
    requestId: null,
    action: null,
  })
  
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false)
  
  const statuses = ['All', 'Approved', 'Pending', 'Rejected']

  const totalPages = Math.ceil(totalCount / pageSize)

  const handleViewLeaveRequest = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request)
    setIsModalOpen(true)
  }

  const confirmApproval = (id: string) => {
    setConfirmationModal({
      isOpen: true,
      requestId: id,
      action: 'approve'
    })
  }
  
  const confirmRejection = (id: string) => {
    setSelectedLeaveRequest(leaveRequests.find(req => req.id === id) || null)
    setIsModalOpen(true)
  }

  const handleApproveLeaveRequest = async (id: string) => {
    setConfirmationModal({isOpen: false, requestId: null, action: null})
    
    setProcessingRequestIds(prev => new Set(prev).add(id))
    
    try {
      const result = await updateLeaveRequestStatus(id, 'approved')
      if (result.success) {
        toast.success('Leave request approved')
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
    } finally {
      setProcessingRequestIds(prev => {
        const updated = new Set(prev)
        updated.delete(id)
        return updated
      })
    }
  }

  const handleRejectLeaveRequest = async (id: string, rejectionReason?: string) => {
    try {
      if (!rejectionReason?.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      
      setProcessingRequestIds(prev => new Set(prev).add(id))
      
      const result = await updateLeaveRequestStatus(id, 'rejected', rejectionReason)
      if (result.success) {
        toast.success('Leave request rejected')
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
        setIsModalOpen(false)
      } else {
        toast.error(result.error || 'Failed to reject leave request')
      }
    } catch {
      toast.error('An error occurred while rejecting the request')
    } finally {
      setProcessingRequestIds(prev => {
        const updated = new Set(prev)
        updated.delete(id)
        return updated
      })
    }
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter(null)
    setDateRange({startDate: null, endDate: null})
  }

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
        
      const result = await getLeaveRequests(
        status, 
        searchTerm,
        dateRange.startDate,
        dateRange.endDate,
        currentPage,
        pageSize
      )
  
      if (result.success) {
        setLeaveRequests(result.leaveRequests || [])
        setTotalCount(result.totalCount || 0)
      } else {
        toast.error(result.error || 'Failed to fetch leave requests')
        setLeaveRequests([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      toast.error('An error occurred while fetching leave requests')
      setLeaveRequests([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm, dateRange.startDate, dateRange.endDate])
  
  useEffect(() => {
    fetchLeaveRequests()
  }, [currentPage, pageSize, statusFilter, searchTerm, dateRange.startDate, dateRange.endDate])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const renderSkeleton = () => (
    <div className="space-y-5 py-3">
      {Array(5).fill(0).map((_, idx) => (
        <div key={idx} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex flex-col space-y-4">
            <div className="h-5 bg-gray-100 rounded-md w-1/4 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-100 rounded-md w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded-md w-1/2 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-100 rounded-md w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded-md w-3/4 animate-pulse"></div>
            </div>
            <div className="flex justify-end">
              <div className="h-9 bg-gray-100 rounded-lg w-28 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Leave Requests</h1>
        
        <button
          onClick={() => setShowFiltersOnMobile(!showFiltersOnMobile)}
          className="md:hidden px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-150"
        >
          {showFiltersOnMobile ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <div className={`p-5 border-b border-gray-100 space-y-5 ${showFiltersOnMobile || 'hidden md:block'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="relative w-full md:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, leave type..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Calendar className="absolute w-4 h-4 left-3.5 top-3 text-gray-500" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-2">
                  <input
                    type="date"
                    className="w-full sm:w-auto appearance-none pl-10 pr-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
                    value={dateRange.startDate || ''}
                    onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value || null}))}
                    placeholder="Start Date"
                  />
                  <span className="text-gray-400 hidden sm:inline">to</span>
                  <input
                    type="date"
                    className="w-full sm:w-auto appearance-none pl-3 pr-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
                    value={dateRange.endDate || ''}
                    onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value || null}))}
                    placeholder="End Date"
                  />
                </div>
              </div>
            
              <div className="relative w-full sm:w-auto">
                <Filter className="absolute w-4 h-4 left-3.5 top-3 text-gray-500" />
                <select
                  className="w-full sm:w-auto appearance-none pl-10 pr-10 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
                  value={statusFilter || 'All'}
                  onChange={(e) => setStatusFilter(e.target.value === 'All' ? null : e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          
          {(searchTerm || statusFilter || dateRange.startDate || dateRange.endDate) && (
            <div className="flex items-center justify-between pt-2 text-sm">
              <div className="text-gray-500">
                <span>Active filters: </span>
                {searchTerm && <span className="mx-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-700">{searchTerm}</span>}
                {statusFilter && <span className="mx-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-700">{statusFilter}</span>}
                {(dateRange.startDate || dateRange.endDate) && (
                  <span className="mx-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-700">
                    Date range
                  </span>
                )}
              </div>
              <button 
                onClick={clearAllFilters}
                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Leave Mode
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Applied On
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-600 font-medium">No leave requests found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request) => {
                  const isProcessing = processingRequestIds.has(request.id);
                  
                  return (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.nurseName}</div>
                            <div className="text-xs text-gray-500">{request.nurseId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">{request.leaveType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{request.leaveMode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {format(parseISO(request.startDate), 'MMM dd, yyyy')} 
                          {request.startDate !== request.endDate && (
                            <span className="flex items-center gap-1">
                              <span className="inline-block w-3 h-px bg-gray-300 mx-1"></span>
                              {format(parseISO(request.endDate), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">{request.days}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(parseISO(request.appliedOn), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 hover:underline mr-4 transition-colors"
                          onClick={() => handleViewLeaveRequest(request)}
                        >
                          View
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button 
                              className={`text-green-600 hover:text-green-900 hover:underline mr-4 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => confirmApproval(request.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? 'Processing...' : 'Approve'}
                            </button>
                            <button 
                              className={`text-red-600 hover:text-red-900 hover:underline transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => confirmRejection(request.id)}
                              disabled={isProcessing}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            renderSkeleton()
          ) : leaveRequests.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="flex flex-col items-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 font-medium">No leave requests found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaveRequests.map((request) => {
                const isProcessing = processingRequestIds.has(request.id);
                
                return (
                  <div key={request.id} className="p-5 space-y-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{request.nurseName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{request.nurseId}</p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="text-gray-800">
                        <span className="text-gray-500 block text-xs mb-0.5">Type</span> 
                        {request.leaveType}
                      </div>
                      <div className="text-gray-800">
                        <span className="text-gray-500 block text-xs mb-0.5">Mode</span> 
                        {request.leaveMode}
                      </div>
                      <div className="text-gray-800">
                        <span className="text-gray-500 block text-xs mb-0.5">Days</span> 
                        {request.days}
                      </div>
                      <div className="text-gray-800">
                        <span className="text-gray-500 block text-xs mb-0.5">Applied</span> 
                        {format(parseISO(request.appliedOn), 'MMM dd')}
                      </div>
                      <div className="col-span-2 text-gray-800">
                        <span className="text-gray-500 block text-xs mb-0.5">Period</span> 
                        {format(parseISO(request.startDate), 'MMM dd, yyyy')} 
                        {request.startDate !== request.endDate && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="inline-block w-3 h-px bg-gray-300 mx-1"></span>
                            {format(parseISO(request.endDate), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                        onClick={() => handleViewLeaveRequest(request)}
                      >
                        View
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button 
                            className={`px-3.5 py-1.5 bg-green-50 text-green-600 rounded-md text-sm font-medium hover:bg-green-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => confirmApproval(request.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? '...' : 'Approve'}
                          </button>
                          <button 
                            className={`px-3.5 py-1.5 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => confirmRejection(request.id)}
                            disabled={isProcessing}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
            Showing <span className="font-medium text-gray-900">{leaveRequests.length}</span> of{" "}
            <span className="font-medium text-gray-900">{totalCount}</span> results
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <select
              className="w-full sm:w-auto pl-3 pr-8 py-1.5 border border-gray-200 bg-white rounded-md text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              {[5, 10, 25, 50].map(size => (
                <option key={size} value={size} className='text-gray-700'>
                  {size} per page
                </option>
              ))}
            </select>
            
            <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium ${
                  currentPage === 1 
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </button>
              
              <div className="hidden sm:flex">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage - 2 + i;
                  
                  if (currentPage < 3) {
                    pageNum = i + 1;
                  } else if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  }
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-150'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <div className="sm:hidden border border-gray-200 bg-white px-4 py-2">
                <span className="text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages || 1}
                </span>
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium ${
                  currentPage === totalPages || totalPages === 0
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150'
                }`}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {selectedLeaveRequest && (
        <LeaveRequestModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          leaveRequest={selectedLeaveRequest}
          onApprove={handleApproveLeaveRequest}
          onReject={handleRejectLeaveRequest}
        />
      )}

      {confirmationModal.isOpen && confirmationModal.action === 'approve' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full m-4 border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-50 border border-green-100 rounded-full mb-6">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-3">
              Approve Leave Request
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Are you sure you want to approve this leave request? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-150"
                onClick={() => setConfirmationModal({isOpen: false, requestId: null, action: null})}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm transition-all duration-150"
                onClick={() => {
                  if (confirmationModal.requestId) {
                    handleApproveLeaveRequest(confirmationModal.requestId)
                  }
                }}
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}