import React, { useState, useEffect } from 'react';
import { Nurse } from '@/types/staff.types';
import NurseCard from './NurseCard';
import { X, FileQuestion } from 'lucide-react';
import AssignmentList from '@/components/client/ApprovedContent/AssignmentList';
import LeaveStatus from '@/components/client/ApprovedContent/LeaveStatus';
import NurseCardsSkeleton from '@/components/client/ApprovedContent/NurseCardsSkeleton';

interface NurseWithAssignment extends Nurse {
  assignments?: {
    startDate: string;
    endDate: string | null;
    shiftType: 'day' | 'night' | '24h';
    clientId: string;
    clientType: string;
    registrationNumber: string;
  }[];
  leaveInfo?: {
    startDate: string;
    endDate?: string;
    reason?: string;
  };
}

interface NurseListModalProps {
  isOpen: boolean;
  nurses: NurseWithAssignment[];
  clientId: string;
  onClose: () => void;
  onAssignNurse: (nurseId: string) => void;
  onViewProfile: (nurse: Nurse) => void;
  currentPage: number;
  totalPages: number;
  totalNurses: number;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { status?: string; city?: string; admittedType?: string; searchTerm?: string }) => void;
  filters: { status?: string; city?: string; admittedType?: string; searchTerm?: string };
  isLoading: boolean;
}

const INPUT_BASE_CLASS = "w-full border border-slate-200 rounded-sm py-2 px-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-slate-300 transition-colors";

export default function NurseListModal({
  isOpen,
  nurses,
  clientId,
  onClose,
  onAssignNurse,
  onViewProfile,
  currentPage,
  totalPages,
  totalNurses,
  onPageChange,
  onFilterChange,
  filters,
  isLoading
}: NurseListModalProps) {
  const [selectedNurses, setSelectedNurses] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        status: statusFilter || undefined,
        searchTerm: searchTerm || undefined,
      });
    }, 400);
    return () => clearTimeout(handler);
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    setStatusFilter(filters.status || '');
    setSearchTerm(filters.searchTerm || '');
  }, [filters]);

  if (!isOpen) return null;

  const handleAssignSelected = () => {
    if (selectedNurses.length > 0) {
      const queryParams = new URLSearchParams();
      selectedNurses.forEach(id => queryParams.append('nurseIds', id));
      queryParams.append('clientId', clientId);
      window.open(`/schedule-shifts?${queryParams.toString()}`, '_blank');
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
    onFilterChange({ status: undefined, searchTerm: undefined });
  };

  const toggleNurseSelection = (nurseId: string, isSelected: boolean) => {
    setSelectedNurses(prev => isSelected ? [...prev, nurseId] : prev.filter(id => id !== nurseId));
  };

  const renderPagination = () => {
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
      <div className="flex justify-center mt-4 gap-1">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded border border-slate-200 text-sm text-gray-700 hover:text-blue-700
           disabled:text-gray-400 disabled:opacity-50"
        >
          Prev
        </button>
        {pageNumbers.map(page => (
          <button 
            key={page} 
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded text-sm border ${
              currentPage === page 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-slate-200 text-gray-700 hover:text-blue-700 hover:border-blue-500'
            }`}
          >
            {page}
          </button>
        ))}
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded border border-slate-200 text-sm text-gray-700
           hover:text-blue-700 disabled:text-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  const startRecord = ((currentPage - 1) * nurses.length) + 1;
  const endRecord = Math.min(startRecord + nurses.length - 1, totalNurses);

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-1 sm:p-2">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] overflow-y-auto relative shadow-xl rounded-sm">
        <div className="sticky top-0 bg-white z-10 border-b border-slate-200">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Nurse Assignment</h1>
              <p className="text-xs text-gray-500">Select nurses to assign to the client</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedNurses.length > 0 && (
                <span className="text-sm font-medium text-gray-600">{selectedNurses.length} selected</span>
              )}
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700
                 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={selectedNurses.length === 0}
                onClick={handleAssignSelected}
              >
                Assign Selected
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-3 border-t border-slate-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    id="statusFilter"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={INPUT_BASE_CLASS}
                  >
                    <option value="">All</option>
                    <option value="assigned">Assigned</option>
                    <option value="unassigned">Available</option>
                    <option value="leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Organization</label>
                  <div className="w-full border border-slate-200 rounded-sm py-2 px-3 text-sm text-gray-800 bg-gray-100">
                    {filters.admittedType === 'DearCare' ? 'Dearcare LLP' : 
                     filters.admittedType === 'TataHomeNursing' ? 'Tata HomeNursing' : 'All'}
                  </div>
                </div>
                <div>
                  <label htmlFor="searchTerm" className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                  <input 
                    id="searchTerm"
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter city, nurse name, etc." 
                    className={INPUT_BASE_CLASS}
                  />
                </div>
              </div>
              <div className="flex items-end mt-3 md:mt-0">
                <button 
                  onClick={clearFilters}
                  disabled={!statusFilter && !searchTerm}
                  className="px-3 py-2 border border-slate-200 text-gray-700 text-sm rounded-sm hover:bg-gray-50
                   transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto focus:outline-none focus:border-slate-400"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4 flex flex-col min-h-[600px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <NurseCardsSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {nurses.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-medium text-gray-700">
                      showing {startRecord}-{endRecord} of {totalNurses} nurses available
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nurses.map((nurse) => (
                      <NurseCard 
                        key={nurse._id}
                        nurse={nurse}
                        onAssign={(n) => onAssignNurse(n._id)}
                        onViewProfile={onViewProfile}
                        selectable={true}
                        isSelected={selectedNurses.includes(nurse._id)}
                        onSelectChange={toggleNurseSelection}
                      >
                        {nurse.leaveInfo ? (
                          <LeaveStatus leaveInfo={nurse.leaveInfo} />
                        ) : (
                          <AssignmentList assignments={nurse.assignments} />
                        )}
                      </NurseCard>
                    ))}
                  </div>
                  {totalPages > 0 && renderPagination()}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border border-dashed
                 border-slate-200 rounded-sm bg-slate-50">
                  <FileQuestion className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-lg font-medium text-slate-700">No nurses found</p>
                  <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search terms</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}