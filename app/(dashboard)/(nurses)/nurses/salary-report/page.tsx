'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AttendanceTable } from '@/components/assignment/AttendanceTable';
import { useNurseAttendance } from '@/hooks/useNurseAttendance';
import { AttendanceModal } from '@/components/assignment/AttendanceModal';
import { 
  markAttendance, 
  unmarkAttendance 
} from '@/app/actions/attendance/attendance-actions';
import ErrorState from '@/components/common/ErrorState';
import { usePagination } from '@/hooks/usePagination';
import { AttendanceRecord } from '@/hooks/useNurseAttendance';

function SalaryReportContent() {
  const searchParams = useSearchParams();
  const nurseId = Number(searchParams.get('nurseId'));
  const startDate = searchParams.get('payPeriodStart') || '';
  const endDate = searchParams.get('payPeriodEnd') || '';

  const {
    page,
    pageSize,
    changePage,
    changePageSize,
  } = usePagination(1, 10);

  const [modalOpen, setModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const {
    attendanceRecords,
    loading,
    error,
    totalPages,
    currentPage,
    recordsCount,
    refetch,
  } = useNurseAttendance(
    nurseId,
    startDate,
    endDate,
    page,
    pageSize
  );

  const handlePreviousPage = () => changePage(page - 1, totalPages);
  const handleNextPage = () => changePage(page + 1, totalPages);
  const handlePageChange = (newPage: number) => changePage(newPage, totalPages);
  const handlePageSizeChange = (newSize: number) => changePageSize(newSize);

  const openModal = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setCheckIn(record?.checkIn || "");
    setCheckOut(record?.checkOut || "");
    setAttendanceError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
    setCheckIn("");
    setCheckOut("");
    setAttendanceError(null);
  };

  const handleMarkAttendance = async () => {
    if (!selectedRecord) return;
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const res = await markAttendance({
        assignmentId: selectedRecord.assignmentId,
        date: selectedRecord.date,
        checkIn,
        checkOut,
        isAdminAction: true
      });
      if (res.success) {
        closeModal();
        refetch();
      }
    } catch {
      setAttendanceError('Failed to mark attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleUnmarkAttendance = async (id: number) => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const res = await unmarkAttendance({ id });
      if (res.success) {
        refetch();
      }
    } catch {
      setAttendanceError('Failed to unmark attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (!nurseId) {
    return <ErrorState message="Please select a nurse to view the salary report." />;
  }

  if (error) {
    return <ErrorState message={error || 'Attendance records not found'} />;
  }

  const nurseInfo = attendanceRecords?.[0];

  return (
    <div className="w-full mx-auto">
      <div className="bg-white shadow-none border border-slate-200 rounded-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {loading ? (
                  <span className="inline-block h-8 w-48 bg-slate-200 rounded animate-pulse" />
                ) : (
                  nurseInfo?.nurseName || 'Salary Report'
                )}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                {loading ? (
                  <span className="inline-block h-5 w-64 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <>
                    {nurseInfo?.nurseRegNo && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">Reg No:</span>
                        <span className="font-mono text-xs font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {nurseInfo.nurseRegNo}
                        </span>
                      </div>
                    )}
                    
                    {nurseInfo?.nursePrevRegNo && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500">Prev Reg No:</span>
                        <span className="font-mono text-xs font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {nurseInfo.nursePrevRegNo}
                        </span>
                      </div>
                    )}

                    {!nurseInfo?.nurseRegNo && !nurseInfo?.nursePrevRegNo && !loading && nurseInfo && (
                       <span className="text-slate-400 italic">No registration details available</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {startDate && endDate && (
              <div className="text-left sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 border border-slate-100 sm:border-0 rounded-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pay Period</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-slate-700">{startDate}</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-sm font-medium text-slate-700">{endDate}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center sm:items-center 
            justify-between mb-4 pb-2 border-b border-slate-200"
          >
            <h2 className="text-sm sm:text-md font-medium text-slate-800 flex items-center">
              Daily Attendance Records
            </h2>
          </div>
          <AttendanceTable
            attendanceRecords={attendanceRecords}
            tableLoading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            recordsCount={recordsCount}
            pageSize={pageSize}
            handlePageSizeChange={handlePageSizeChange}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            handlePageChange={handlePageChange}
            openModal={openModal}
            handleUnmarkAttendance={handleUnmarkAttendance}
          />
        </div>
      </div>
      <AttendanceModal
        modalOpen={modalOpen}
        closeModal={closeModal}
        selectedRecord={selectedRecord}
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
        attendanceLoading={attendanceLoading}
        attendanceError={attendanceError}
        handleMarkAttendance={handleMarkAttendance}
        shiftStartTime={selectedRecord?.shiftStartTime}
        shiftEndTime={selectedRecord?.shiftEndTime}
      />
    </div>
  );
}

export default function SalaryReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading salary report...</div>}>
      <SalaryReportContent />
    </Suspense>
  );
}