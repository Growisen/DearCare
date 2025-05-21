import React, { memo } from "react"
import { Clock, MapPin } from "lucide-react"
import { AttendanceRecord } from "@/app/actions/attendance-actions"
import LocationMap from "@/components/staff/attendance/LocationMap"

type AttendanceTableProps = {
  attendanceData: AttendanceRecord[]
  resolvedLocations: Record<number, string>
}

const AttendanceTableRow = memo(({ record, locationName }: { 
  record: AttendanceRecord, 
  locationName: string
}) => {
  return (
    <tr className="hover:bg-gray-50">
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
        {locationName ? (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span>{locationName}</span>
            </div>
            {record.location && (
              <div className="ml-6 w-56">
                <LocationMap location={record.location} />
              </div>
            )}
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
          record.status === 'Present' ? 'bg-green-100 text-green-800 border border-green-200' : 
          record.status === 'Late' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {record.status}
        </span>
      </td>
    </tr>
  );
});

AttendanceTableRow.displayName = 'AttendanceTableRow';

const AttendanceMobileCard = memo(({ record, locationName }: { 
  record: AttendanceRecord, 
  locationName: string
}) => {
  return (
    <div className="p-5 space-y-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{record.nurseName}</h3>
          <p className="text-sm text-gray-500 mt-1">{record.date}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          record.status === 'Present' ? 'bg-green-100 text-green-800 border border-green-200' : 
          record.status === 'Late' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {record.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm bg-white border border-gray-200 p-3 rounded-lg">
        <p className="text-gray-500">Scheduled Time:</p>
        <p className="text-gray-800 font-medium">{record.scheduledStart || "N/A"} - {record.scheduledEnd || "N/A"}</p>
        <p className="text-gray-500">Actual Time:</p>
        <p className="text-gray-800">{record.shiftStart || "N/A"} - {record.shiftEnd || "N/A"}</p>
        <p className="text-gray-500">Hours Worked:</p>
        <p className="text-gray-800">{record.hoursWorked || "N/A"}</p>
        <p className="text-gray-500">Location:</p>
        <p className="text-gray-800 break-all">{locationName || "Resolving location..."}</p>
      </div>
    </div>
  );
});

AttendanceMobileCard.displayName = 'AttendanceMobileCard';

export const AttendanceTable = memo(function AttendanceTable({ 
  attendanceData, 
  resolvedLocations 
}: AttendanceTableProps) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr className="text-left">
              <th className="px-6 py-4 font-medium text-gray-700">Nurse Name</th>
              <th className="px-6 py-4 font-medium text-gray-700">Date</th>
              <th className="px-6 py-4 font-medium text-gray-700">Scheduled Time</th>
              <th className="px-6 py-4 font-medium text-gray-700">Actual Time</th>
              <th className="px-6 py-4 font-medium text-gray-700">Hours Worked</th>
              <th className="px-6 py-4 font-medium text-gray-700">Location</th>
              <th className="px-6 py-4 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {attendanceData.length > 0 ? (
              attendanceData.map((record) => (
                <AttendanceTableRow 
                  key={record.id} 
                  record={record}
                  locationName={resolvedLocations[record.id] || ""}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden bg-white">
        {attendanceData.length > 0 ? (
          attendanceData.map((record) => (
            <AttendanceMobileCard
              key={record.id}
              record={record}
              locationName={resolvedLocations[record.id] || ""}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No attendance records found
          </div>
        )}
      </div>
    </div>
  )
});