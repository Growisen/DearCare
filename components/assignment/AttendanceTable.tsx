import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { PaginationControls } from '@/components/client/clients/PaginationControls';
import { AttendanceRecord } from '@/hooks/useAssignment';

function formatTime(timeString: string | null) {
  if (!timeString) return "—";
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'absent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'overtime':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'early-departure':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function createGoogleMapsLink(location: string | null): { url: string | null, isValidLocation: boolean } {
  if (!location) return { url: null, isValidLocation: false };
  const parts = location.split(',').map(part => part.trim());
  if (parts.length !== 2) return { url: null, isValidLocation: false };
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return { url: null, isValidLocation: false };
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  return { url, isValidLocation: true };
}

export function AttendanceTable({
  attendanceRecords,
  tableLoading,
  openModal,
  currentPage,
  totalPages,
  recordsCount,
  pageSize,
  handlePreviousPage,
  handleNextPage,
  handlePageChange,
}: {
  attendanceRecords: AttendanceRecord[];
  tableLoading: boolean;
  openModal: (record: AttendanceRecord) => void;
  currentPage: number;
  totalPages: number;
  recordsCount: number;
  pageSize: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  handlePageChange: (page: number) => void;
}) {
  if (tableLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-200 rounded w-full"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-slate-100 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (attendanceRecords.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-8 max-w-md mx-auto">
          <CalendarIcon className="h-12 w-12 mx-auto text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-700">No attendance records</h3>
          <p className="mt-2 text-sm text-slate-500">
            There are no attendance records available for this assignment yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Check-in Time</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Check-out Time</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Total Hours</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Entry Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attendanceRecords.map((record, index) => {
              const { url: locationUrl, isValidLocation } = createGoogleMapsLink(record.location || null);
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-slate-50 transition-colors' : 'bg-slate-50 hover:bg-slate-100 transition-colors'}>
                  <td className="px-4 py-4 text-sm text-slate-900 font-medium">
                    {format(new Date(record.date), 'EEE, MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {record.checkIn ? formatTime(record.checkIn) : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {record.checkOut ? formatTime(record.checkOut) : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {record.totalHours === '0' ? '—' : `${record.totalHours}`}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClasses(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 max-w-xs">
                    {isValidLocation ? (
                      <a
                        href={locationUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        View on Map
                      </a>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {record.status === 'Absent' ? (
                      '—'
                    ) : record.isAdminAction ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        Admin Entry
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        Self Check-in
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {(record.status?.toLowerCase() === 'absent') && (
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                        onClick={() => openModal(record)}
                      >
                        Mark Attendance
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        {attendanceRecords.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={recordsCount}
            pageSize={pageSize}
            itemsLength={attendanceRecords.length}
            onPageChange={handlePageChange}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />
        )}
      </div>
    </>
  );
}