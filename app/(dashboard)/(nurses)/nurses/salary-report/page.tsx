'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AttendanceTable } from '@/components/assignment/AttendanceTable';
import { useNurseAttendance } from '@/hooks/useNurseAttendance';
import { AttendanceModal } from '@/components/assignment/AttendanceModal';
import { markAttendance, unmarkAttendance } from '@/app/actions/attendance/attendance-actions';

function SalaryReportContent() {
  const searchParams = useSearchParams();
  const nurseId = Number(searchParams.get('nurseId'));
  const startDate = searchParams.get('payPeriodStart') || '';
  const endDate = searchParams.get('payPeriodEnd') || '';

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const handlePreviousPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => p + 1);
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openModal = (record: any) => {
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

  // Mark attendance handler
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
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-red-500 text-xl mb-4">Nurse Not Selected</div>
          <p className="text-slate-700">Please select a nurse to view the salary report.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-8 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mt-4"></div>
          <p className="text-slate-500 mt-4">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-red-500 text-xl mb-4">Error Loading Attendance</div>
          <p className="text-slate-700">{error || 'Attendance records not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Salary Report</h1>
          <p className="text-slate-700 mt-2">
            Detailed salary and attendance history for Nurse #{nurseId}
          </p>
        </div>
        <div className="p-5">
          <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center sm:items-center justify-between mb-4 pb-2 border-b border-slate-200">
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
    <Suspense fallback={<div className="p-8 text-center">Loading salary report...</div>}>
      <SalaryReportContent />
    </Suspense>
  );
}