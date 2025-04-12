"use client"
import { useState, useEffect } from 'react'
import { Calendar, Clock, Filter, Download, Printer, MapPin } from 'lucide-react'
import { fetchStaffAttendance, AttendanceRecord } from '@/app/actions/attendance-actions'
import { getLocationName } from '@/utils/geocoding'

// Shift types for filtering
const shiftTypes = [
  { value: 'all', label: 'All Shifts' },
  { value: 'morning', label: 'Morning (07:00-15:00)' },
  { value: 'afternoon', label: 'Afternoon (15:00-23:00)' },
  { value: 'night', label: 'Night (23:00-07:00)' },
  { value: 'custom', label: 'Custom Hours' },
];

export default function StaffAttendancePage() {
  // State for attendance data and loading state
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedShift, setSelectedShift] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [resolvedLocations, setResolvedLocations] = useState<Record<number, string>>({})
  
  // Fetch data when selectedDate changes
  useEffect(() => {
    const loadAttendanceData = async () => {
      setLoading(true);
      try {
        // Format the date as YYYY-DD-MM before sending to server
        const date = new Date(selectedDate);
        const formattedDate = `${date.getFullYear()}-${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const result = await fetchStaffAttendance(formattedDate);
        console.log("result", result)
        if (result.success) {
          setAttendanceData(result.data);
          setError(null);
        } else {
          setError(result.error || 'Failed to load attendance data');
          setAttendanceData([]);
        }
      } catch {
        setError('An error occurred while fetching attendance data');
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAttendanceData();
  }, [selectedDate]);
  
  // Resolve locations after attendance data is loaded
  useEffect(() => {
    async function resolveLocations() {
      if (!attendanceData.length) return;
      
      const locations: Record<number, string> = {};
      
      for (const record of attendanceData) {
        try {
          if (record.location && typeof record.location === 'string') {
            // If it looks like JSON coordinates
            if (record.location.includes('latitude')) {
              const coords = JSON.parse(record.location);
              const locationName = await getLocationName(coords);
              locations[record.id] = locationName;
            } else {
              locations[record.id] = record.location;
            }
          }
        } catch (error) {
          console.error(`Failed to resolve location for record ${record.id}:`, error);
          locations[record.id] = record.location || 'Unknown';
        }
      }
      
      setResolvedLocations(locations);
    }
    
    if (!loading && !error) {
      resolveLocations();
    }
  }, [attendanceData, loading, error]);
  
  // Filter the data based on selected filters
  const filteredData = attendanceData.filter(record => {
    const shiftMatch = 
      selectedShift === 'all' || 
      (selectedShift === 'morning' && record.shiftStart.startsWith('07:')) ||
      (selectedShift === 'afternoon' && record.shiftStart.startsWith('15:')) ||
      (selectedShift === 'night' && record.shiftStart.startsWith('23:'));
    
    const searchMatch = 
      searchTerm === '' || 
      record.nurseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return shiftMatch && searchMatch;
  });

  // Calculate summary statistics
  // const totalNurses = filteredData.length
  // const presentNurses = filteredData.filter(record => record.status === 'Present').length
  // const lateNurses = filteredData.filter(record => record.status === 'Late').length
  // const absentNurses = filteredData.filter(record => record.status === 'Absent').length

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Attendance</h1>
          <p className="text-sm text-gray-700">Track and manage nursing staff attendance records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="pl-10 pr-4 py-2 text-gray-950 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-700">Total Staff</p>
          <p className="text-2xl font-semibold text-stone-700">{totalNurses}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-700">Present</p>
          <p className="text-2xl font-semibold text-green-700">{presentNurses}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-700">Late</p>
          <p className="text-2xl font-semibold text-amber-600">{lateNurses}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-700">Absent</p>
          <p className="text-2xl font-semibold text-red-600">{absentNurses}</p>
        </div>
      </div> */}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full md:w-auto text-gray-950 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {shiftTypes.map(shift => (
                <option key={shift.value} value={shift.value}>{shift.label}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-950 hover:bg-gray-200 rounded-md text-sm">
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-950 hover:bg-gray-200 rounded-md text-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-6 text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => fetchStaffAttendance(selectedDate)} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nurse Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Scheduled Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actual Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hours Worked</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.nurseName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">Start:</span> {record.scheduledStart || "N/A"}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">End:</span> {record.scheduledEnd || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">Start:</span> {record.shiftStart || "N/A"}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">End:</span> {record.shiftEnd || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.hoursWorked || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {resolvedLocations[record.id] ? (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{resolvedLocations[record.id]}</span>
                          </div>
                        ) : record.location ? (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span>Resolving location...</span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                          record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-700">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination - only show when we have data */}
        {!loading && !error && filteredData.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredData.length}</span> of{' '}
                  <span className="font-medium">{filteredData.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}