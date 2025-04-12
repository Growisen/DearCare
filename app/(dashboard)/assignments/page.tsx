"use client"

import { useState, useEffect } from 'react'
import { getAllNurseAssignments, NurseAssignmentData } from '../../actions/shift-schedule-actions'
import { format } from 'date-fns'
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<NurseAssignmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  
  useEffect(() => {
    async function fetchAllAssignments() {
      setLoading(true)
      try {
        const response = await getAllNurseAssignments()
        if (response.success && response.data) {
          setAssignments(response.data)
          setError(null)
        } else {
          setError(response.error || 'Failed to load assignments')
          setAssignments([])
        }
      } catch (err) {
        setError('Unexpected error occurred while fetching assignments')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAllAssignments()
  }, [])
  
  const filteredAssignments = filterStatus === 'all' 
    ? assignments 
    : assignments.filter(a => a.status === filterStatus)
  
  function formatTime(timeString: string) {
    try {
      const [hours, minutes] = timeString.split(':').map(Number)
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
    } catch {
      return timeString
    }
  }
  
  function getStatusBadgeClasses(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-500';
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nurse Assignments</h1>
          <p className="text-gray-600">Manage and view all nurse scheduling assignments</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
          <button 
            onClick={() => setFilterStatus('all')} 
            className={`px-3 py-1.5 text-sm rounded-md transition ${filterStatus === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterStatus('active')} 
            className={`px-3 py-1.5 text-sm rounded-md transition ${filterStatus === 'active' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilterStatus('completed')} 
            className={`px-3 py-1.5 text-sm rounded-md transition ${filterStatus === 'completed' ? 'bg-gray-100 text-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilterStatus('cancelled')} 
            className={`px-3 py-1.5 text-sm rounded-md transition ${filterStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-2">No assignments found</p>
          {filterStatus !== 'all' && (
            <button 
              onClick={() => setFilterStatus('all')}
              className="text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nurse ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{assignment.nurse_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{assignment.assigned_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500">
                        {format(new Date(assignment.start_date), 'MMM dd, yyyy')} - 
                        {format(new Date(assignment.end_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-500">
                        {formatTime(assignment.shift_start_time)} - {formatTime(assignment.shift_end_time)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(assignment.status)}`}>
                      {assignment.status ? assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1) : 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500">Showing {filteredAssignments.length} assignments</p>
          </div>
        </div>
      )}
    </div>
  )
}