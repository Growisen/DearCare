import { NurseAssignmentData } from "@/app/actions/scheduling/shift-schedule-actions"
import { 
  AssignmentAttendanceDetails, 
  getTodayAttendanceForAssignment, 
  adminCheckInNurse, 
  adminCheckOutNurse,
  markLongShiftAttendance 
} from "@/app/actions/attendance/attendance-actions"
import { format, isBefore, parseISO } from "date-fns"
import { CalendarIcon, ClockIcon, UserIcon, XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { AlertCircle, Building, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link" 
import ConfirmationModal from "@/components/common/ConfirmationModal"
import { useDashboardData } from "@/hooks/useDashboardData"
import { formatName } from "@/utils/formatters"

const LONG_SHIFT_HOUR_THRESHOLD = 22;

type AssignmentDetailsOverlayProps = {
  assignment: NurseAssignmentData
  onClose: () => void
}

export function AssignmentDetailsOverlay({ assignment, onClose }: AssignmentDetailsOverlayProps) {
  const { invalidateDashboardCache } = useDashboardData()
  const [attendanceDetails, setAttendanceDetails] = useState<AssignmentAttendanceDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<'check-in' | 'check-out' | null>(null)
  const [showCheckInConfirmation, setShowCheckInConfirmation] = useState(false)
  const [showCheckOutConfirmation, setShowCheckOutConfirmation] = useState(false)
  
  useEffect(() => {
    fetchAttendanceData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment.id])
  
  async function fetchAttendanceData() {
    setLoading(true)
    try {
      const response = await getTodayAttendanceForAssignment(assignment.id)
      if (response.success && response.data) {
        setAttendanceDetails(response.data)
      } else {
        console.error("Error fetching attendance:", response.error)
        setAttendanceDetails(null)
      }
    } catch (error) {
      console.error("Error in attendance fetch:", error)
      setAttendanceDetails(null)
    } finally {
      setLoading(false)
    }
  }

function calculateShiftDurationInHours(startTime: string, endTime: string): number {
  try {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    let durationInMinutes = (endHours - startHours) * 60 + (endMinutes - startMinutes);
    
    if (durationInMinutes < 0) {
      durationInMinutes += 24 * 60;
    }
    
    return durationInMinutes / 60;
  } catch {
    return 0;
  }
}
  
  function openCheckInConfirmation() {
    setShowCheckInConfirmation(true)
  }
  
  function openCheckOutConfirmation() {
    setShowCheckOutConfirmation(true)
  }
  
  async function handleAdminCheckIn() {
    setActionLoading('check-in')
    setShowCheckInConfirmation(false)
    try {
      const result = await adminCheckInNurse(assignment.id)
      if (result.success) {
        invalidateDashboardCache()
        await fetchAttendanceData()
      } else {
        console.error("Check-in failed:", result.error)
      }
    } catch (error) {
      console.error("Error during check-in:", error)
    } finally {
      setActionLoading(null)
    }
  }
  
  async function handleAdminCheckOut() {
    setActionLoading('check-out')
    setShowCheckOutConfirmation(false)
    try {
      if (!attendanceDetails?.id) {
        console.error("Missing attendance record ID")
        return
      }
      
      const result = await adminCheckOutNurse(attendanceDetails.id)
      if (result.success) {
        invalidateDashboardCache()
        await fetchAttendanceData()
      } else {
        console.error("Check-out failed:", result.error)
      }
    } catch (error) {
      console.error("Error during check-out:", error)
    } finally {
      setActionLoading(null)
    }
  }
  
  async function handleMarkLongShiftAttendance() {
    setActionLoading('check-in')
    setShowCheckInConfirmation(false)
    try {
      const result = await markLongShiftAttendance(assignment.id)
      if (result.success) {
        invalidateDashboardCache()
        await fetchAttendanceData()
      } else {
        console.error("Attendance marking failed")
      }
    } catch (error) {
      console.error("Error during attendance marking:", error)
    } finally {
      setActionLoading(null)
    }
  }
  
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

  const fullName = assignment.nurse_first_name && assignment.nurse_last_name
    ? `${assignment.nurse_first_name} ${assignment.nurse_last_name}`
    : "Unknown Nurse"
  
  const clientName = assignment.client_name || "Unknown Client"
  const clientType = assignment.client_type
  
  const today = new Date()
  
  const startDate = parseISO(assignment.start_date)
  const endDate = parseISO(assignment.end_date)
  
  const isAssignmentStarted = !isBefore(today, startDate)
  const isAssignmentEnded = !isBefore(today, endDate)
  const isAssignmentActive = isAssignmentStarted && !isAssignmentEnded
  const isAssignmentUpcoming = isBefore(today, startDate)
  
  const checkInStatus = attendanceDetails?.checked_in || false
  const checkInTime = attendanceDetails?.check_in_time 
    ? formatTime(attendanceDetails.check_in_time)
    : null
  const hasCheckedOut = !!attendanceDetails?.check_out_time

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Today&apos;s Assignment Overview</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-3 space-y-6"> 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 py-6">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-700">Nurse Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-gray-900 font-medium">{formatName(fullName)}</div>
                    <p className="text-sm text-gray-500">Reg No: {assignment.nurse_reg_no}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-700">Client Details</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <div className="text-gray-900 font-medium">{formatName(clientName)}</div>
                    {clientType && <p className="text-sm text-gray-500">{clientType}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-5">
            <h3 className="text-base font-semibold text-gray-700">Assignment Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Shift Time</h3>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900">
                    {formatTime(assignment.shift_start_time)} - {formatTime(assignment.shift_end_time)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Assignment Status</h3>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${
                  isAssignmentActive 
                    ? "bg-green-50 text-green-700" 
                    : isAssignmentUpcoming
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-50 text-gray-700"
                }`}>
                  <span className="capitalize">
                    {isAssignmentActive 
                      ? "Active" 
                      : isAssignmentUpcoming 
                        ? "Upcoming" 
                        : "Completed"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Assignment Period</h3>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900">
                    {format(new Date(assignment.start_date), 'MMM dd, yyyy')} - {' '}
                    {format(new Date(assignment.end_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
            
            {isAssignmentActive && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Today&apos;s Check-in Status</h4>
                {loading ? (
                  <div className="flex items-center text-blue-700">
                    <div className="animate-pulse w-5 h-5 bg-blue-200 rounded-full mr-2"></div>
                    <div>
                      <p className="font-medium">Loading attendance data...</p>
                    </div>
                  </div>
                ) : attendanceDetails?.on_leave ? (
                  <div className="flex items-center text-purple-700">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <div>
                      <p className="font-medium">Nurse is on approved leave</p>
                      <p className="text-sm text-purple-700">
                        Leave type: {attendanceDetails.leave_type}
                      </p>
                    </div>
                  </div>
                ) : checkInStatus ? (
                  <div className="flex flex-col">
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <div>
                        <p className="font-medium">Nurse has checked in</p>
                        <p className="text-sm text-blue-700">
                          Last check-in: {checkInTime || 'Time not recorded'}
                        </p>
                        {attendanceDetails?.check_out_time && (
                          <p className="text-sm text-blue-700">
                            Check-out: {formatTime(attendanceDetails.check_out_time)}
                          </p>
                        )}
                        {attendanceDetails?.total_hours && (
                          <p className="text-sm text-blue-700">
                            Hours worked: {attendanceDetails.total_hours}
                          </p>
                        )}
                        {attendanceDetails?.location && (
                          <p className="text-sm text-blue-700">
                            Check-in location: {
                              typeof attendanceDetails.location === 'string' &&
                              (attendanceDetails.location.startsWith('{') || attendanceDetails.location.startsWith('['))
                                ? 'GPS coordinates recorded'
                                : attendanceDetails.location
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {!hasCheckedOut && (
                      <div className="mt-3">
                        <button
                          onClick={openCheckOutConfirmation}
                          disabled={actionLoading === 'check-out'}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            actionLoading === 'check-out' 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {actionLoading === 'check-out' ? (
                            <span className="flex items-center">
                              <span className="animate-pulse mr-2">⏱️</span> Processing...
                            </span>
                          ) : (
                            'Admin Check-out Nurse'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center text-amber-700">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <div>
                        <p className="font-medium">Nurse has not checked in yet</p>
                        <p className="text-sm text-blue-700">Expected check-in: {formatTime(assignment.shift_start_time)}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                    {(() => {
                      const shiftDuration = calculateShiftDurationInHours(
                        assignment.shift_start_time, 
                        assignment.shift_end_time
                      );
                      const isLongShift = shiftDuration > LONG_SHIFT_HOUR_THRESHOLD;
                      
                      return (
                        <button
                          onClick={isLongShift ? openCheckInConfirmation : openCheckInConfirmation}
                          disabled={actionLoading === 'check-in'}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            actionLoading === 'check-in' 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : isLongShift
                                ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                                : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          }`}
                        >
                          {actionLoading === 'check-in' ? (
                            <span className="flex items-center">
                              <span className="animate-pulse mr-2">⏱️</span> Processing...
                            </span>
                          ) : (
                            isLongShift ? 'Mark Attendance' : 'Admin Check-in Nurse'
                          )}
                        </button>
                      );
                    })()}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {isAssignmentUpcoming && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center text-blue-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-medium">This assignment hasn&apos;t started yet</p>
                    <p className="text-sm">
                      Assignment starts on {format(startDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {isAssignmentEnded && !isAssignmentUpcoming && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-medium">This assignment is completed</p>
                    <p className="text-sm">
                      Assignment ended on {format(endDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-between">
          <Link 
            target="_blank"
            href={`/assignments/${assignment.id}`} 
            className="px-4 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5" />
            View Complete Details
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium"
          >
            Close
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showCheckInConfirmation}
        title={(() => {
          const shiftDuration = calculateShiftDurationInHours(
            assignment.shift_start_time, 
            assignment.shift_end_time
          );
          return shiftDuration > LONG_SHIFT_HOUR_THRESHOLD ? "Confirm Attendance" : "Confirm Check-in";
        })()}
        message={(() => {
          const shiftDuration = calculateShiftDurationInHours(
            assignment.shift_start_time, 
            assignment.shift_end_time
          );
          return shiftDuration > LONG_SHIFT_HOUR_THRESHOLD 
            ? `Are you sure you want to mark ${fullName}'s attendance for today's long shift? This will record the full shift hours.`
            : `Are you sure you want to check in ${fullName} for today's shift?`;
        })()}
        onConfirm={(() => {
          const shiftDuration = calculateShiftDurationInHours(
            assignment.shift_start_time, 
            assignment.shift_end_time
          );
          return shiftDuration > LONG_SHIFT_HOUR_THRESHOLD ? handleMarkLongShiftAttendance : handleAdminCheckIn;
        })()}
        onCancel={() => setShowCheckInConfirmation(false)}
        confirmButtonText={(() => {
          const shiftDuration = calculateShiftDurationInHours(
            assignment.shift_start_time, 
            assignment.shift_end_time
          );
          return shiftDuration > LONG_SHIFT_HOUR_THRESHOLD ? "Mark Attendance" : "Check In";
        })()}
        confirmButtonColor="blue"
        isLoading={actionLoading === 'check-in'}
      />

      <ConfirmationModal
        isOpen={showCheckOutConfirmation}
        title="Confirm Check-out"
        message={`Are you sure you want to check out ${fullName} from their shift?`}
        onConfirm={handleAdminCheckOut}
        onCancel={() => setShowCheckOutConfirmation(false)}
        confirmButtonText="Check Out"
        confirmButtonColor="blue"
        isLoading={actionLoading === 'check-out'}
      />
    </div>
  )
}