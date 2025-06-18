'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAssignment } from '@/hooks/useAssignment';
import { AssignmentInfo } from '@/components/assignment/AssignmentInfo';
import { AttendanceTable } from '@/components/assignment/AttendanceTable';
import { AttendanceModal } from '@/components/assignment/AttendanceModal';

export default function AssignmentDetailsPage() {
  const { id } = useParams() as { id: string };
  const {
    loading,
    error,
    assignmentDetails,
    attendanceRecords,
    recordsCount,
    currentPage,
    pageSize,
    handlePreviousPage,
    handleNextPage,
    tableLoading,
    modalOpen,
    openModal,
    closeModal,
    selectedRecord,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    attendanceLoading,
    attendanceError,
    handleMarkAttendance,
  } = useAssignment(id);

  const totalPages = Math.ceil(recordsCount / pageSize);

  const handlePageChange = (page: number) => {
    if (page > currentPage) {
      for (let i = currentPage; i < page; i++) {
        handleNextPage();
      }
    } else if (page < currentPage) {
      for (let i = currentPage; i > page; i--) {
        handlePreviousPage();
      }
    }
  };

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
          <p className="text-slate-500 mt-4">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (error || !assignmentDetails) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-red-500 text-xl mb-4">Error Loading Assignment</div>
          <p className="text-slate-700">{error || 'Assignment not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-bold text-slate-900">Assignment #{assignmentDetails.id}</h1>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${assignmentDetails.status === 'active' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                assignmentDetails.status === 'upcoming' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
              {assignmentDetails.status.charAt(0).toUpperCase() + assignmentDetails.status.slice(1)}
            </div>
          </div>
          <AssignmentInfo assignmentDetails={assignmentDetails} />
        </div>
        <div className="p-5">
          <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center sm:items-center justify-between mb-4 pb-2 border-b border-slate-200">
            <h2 className="text-sm sm:text-md font-medium text-slate-800 flex items-center">
              Daily Attendance Records
            </h2>
          </div>
          <AttendanceTable
            attendanceRecords={attendanceRecords}
            tableLoading={tableLoading}
            openModal={openModal}
            currentPage={currentPage}
            totalPages={totalPages}
            recordsCount={recordsCount}
            pageSize={pageSize}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
            handlePageChange={handlePageChange}
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
      />
    </div>
  );
}