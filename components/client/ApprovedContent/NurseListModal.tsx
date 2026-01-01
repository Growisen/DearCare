import React, { useState, useEffect } from 'react';
import { Nurse } from '@/types/staff.types';
import NurseCard from './NurseCard';
import { formatDate } from '@/utils/formatters';
import { X } from 'lucide-react';

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

const NurseListModal: React.FC<NurseListModalProps> = ({
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
}) => {
  const [selectedNurses, setSelectedNurses] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  // const [admittedTypeFilter, setAdmittedTypeFilter] = useState(filters.admittedType || '');
  const admittedTypeFilter = filters.admittedType;

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        status: statusFilter || undefined,
        searchTerm: searchTerm || undefined,
        //admittedType: admittedTypeFilter || undefined
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [statusFilter, searchTerm/*, admittedTypeFilter*/]);

  useEffect(() => {
    setStatusFilter(filters.status || '');
    setSearchTerm(filters.searchTerm || '');
    // setAdmittedTypeFilter(filters.admittedType || '');
  }, [filters]);
  
  if (!isOpen) return null;

  // const handleNurseSelection = (nurseId: string) => {
  //   setSelectedNurses(prev => 
  //     prev.includes(nurseId) 
  //       ? prev.filter(id => id !== nurseId) 
  //       : [...prev, nurseId]
  //   );
  // };

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
    // setAdmittedTypeFilter('');
    onFilterChange({
      status: undefined,
      searchTerm: undefined,
      //admittedType: undefined
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    pages.push(
      <button 
        key="prev" 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-1 sm:px-2 py-1 mx-0.5 sm:mx-1 rounded border disabled:opacity-50 text-xs sm:text-sm text-gray-700 hover:text-blue-700 disabled:text-gray-400"
      >
        Prev
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => onPageChange(i)}
          className={`px-2 sm:px-3 py-1 mx-0.5 sm:mx-1 rounded text-xs sm:text-sm ${
            currentPage === i 
              ? 'bg-blue-600 text-white' 
              : 'border text-gray-700 hover:text-blue-700 hover:border-blue-500'
          }`}
        >
          {i}
        </button>
      );
    }

    pages.push(
      <button 
        key="next" 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-1 sm:px-2 py-1 mx-0.5 sm:mx-1 rounded border disabled:opacity-50 text-xs sm:text-sm text-gray-700 hover:text-blue-700 disabled:text-gray-400"
      >
        Next
      </button>
    );

    return <div className="flex justify-center mt-4">{pages}</div>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-2">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] overflow-y-auto relative shadow-xl">
        <div className="sticky top-0 bg-white z-10 border-b border-slate-200">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Nurse Assignment</h1>
              <p className="text-xs text-gray-500">Select nurses to assign to the client</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 mr-1">
                {selectedNurses.length > 0 && (
                  <span className="font-medium">{selectedNurses.length} selected</span>
                )}
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                disabled={selectedNurses.length === 0}
                onClick={handleAssignSelected}
              >
                Assign Selected
              </button>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-3">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    id="statusFilter"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-slate-200 rounded-sm py-2 px-3 text-sm text-gray-800 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All</option>
                    <option value="assigned">Assigned</option>
                    <option value="unassigned">Available</option>
                    <option value="leave">On Leave</option>
                  </select>
                </div>
                
                {/* <div>
                  <label htmlFor="admittedTypeFilter" className="block text-xs font-medium text-gray-700 mb-1">Dearcare/Tata HomeNursing</label>
                  <select 
                    id="admittedTypeFilter"
                    value={admittedTypeFilter} 
                    onChange={(e) => setAdmittedTypeFilter(e.target.value)}
                    className="w-full border border-slate-200 rounded-sm py-2 px-3 text-sm text-gray-800 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All</option>
                    <option value="Dearcare_Llp">Dearcare LLP</option>
                    <option value="Tata_Homenursing">Tata HomeNursing</option>
                  </select>
                </div> */}

                <div>
                  <label htmlFor="admittedTypeDisplay" className="block text-xs font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <div
                    id="admittedTypeDisplay"
                    className="w-full border border-slate-200 rounded-sm py-2 px-3 text-sm text-gray-800 bg-gray-100"
                  >
                    {admittedTypeFilter === 'DearCare' && 'Dearcare LLP'}
                    {admittedTypeFilter === 'TataHomeNursing' && 'Tata HomeNursing'}
                    {admittedTypeFilter === '' && 'All'}
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
                    className="w-full border border-slate-200 rounded-sm py-2 px-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 md:items-end md:self-end mt-3 md:mt-0">
                <button 
                  onClick={clearFilters}
                  disabled={!statusFilter && !searchTerm /* && !admittedTypeFilter */}
                  className="px-3 py-2 border border-slate-200 text-gray-700 text-sm rounded-sm hover:bg-gray-50 
                  transition-colors disabled:opacity-40 disabled:text-gray-400 disabled:border-slate-200
                  disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-400 w-full sm:w-auto"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-700">
                  {`showing ${((currentPage - 1) * nurses.length) + 1}-${((currentPage - 1) * nurses.length) + nurses.length > totalNurses ? totalNurses : ((currentPage - 1) * nurses.length) + nurses.length} of ${totalNurses} nurses available`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nurses.map((nurse) => (
                  <div key={nurse._id} className="w-full">
                    <NurseCard 
                      nurse={nurse}
                      onAssign={(nurse) => onAssignNurse(nurse._id)}
                      onViewProfile={onViewProfile}
                      selectable={true}
                      isSelected={selectedNurses.includes(nurse._id)}
                      onSelectChange={(nurseId, isSelected) => {
                        if (isSelected) {
                          setSelectedNurses(prev => [...prev, nurseId]);
                        } else {
                          setSelectedNurses(prev => prev.filter(id => id !== nurseId));
                        }
                      }}
                    >
                      {nurse.assignments && nurse.assignments.length > 0 ? (
                        <div className="mt-2">
                          <div className="flex items-center mb-2">
                            <span className="px-3 py-1 rounded border text-xs font-semibold bg-white text-black border-slate-200">
                              ✓ Assigned
                            </span>
                            <span className="ml-2 text-xs text-gray-600 font-medium">
                              ({nurse.assignments.length} assignment{nurse.assignments.length > 1 ? 's' : ''})
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            {nurse.assignments.map((assignment, index) => (
                              <div 
                                key={`${nurse._id}-assignment-${index}`} 
                                className="bg-gray-50 border border-slate-200 rounded p-2"
                              >
                                <div className="flex items-center mb-1">
                                  <span className="text-black mr-2 font-bold text-xs">•</span>
                                  <span className="font-semibold text-black text-xs">
                                    Assignment {index + 1}
                                  </span>
                                  
                                  {assignment.clientType && (
                                    <span className="ml-2 px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-medium text-black">
                                      {assignment.clientType}
                                    </span>
                                  )}
                                  
                                  {assignment.shiftType && (
                                    <span className="ml-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-medium text-black">
                                      {assignment.shiftType} shift
                                    </span>
                                  )}
                                </div>
                                
                                <div className="text-xs text-gray-600 ml-3">
                                  {assignment.startDate && (
                                    <span className="font-medium">
                                      From: {formatDate(assignment.startDate)}
                                    </span>
                                  )}
                                  
                                  {assignment.endDate && (
                                    <span className="ml-3 font-medium">
                                      To: {formatDate(assignment.endDate)}
                                    </span>
                                  )}
                                  
                                  {!assignment.endDate && assignment.startDate && (
                                    <span className="ml-3 px-2 py-0.5 bg-black text-white rounded text-xs font-semibold">
                                      Ongoing
                                    </span>
                                  )}
                                </div>
                                
                                {assignment.registrationNumber && (
                                  <div className="mt-1 text-xs text-gray-600 ml-3">
                                    <span className="font-medium">Client ID:</span> {assignment.registrationNumber}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        nurse.status !== 'leave' && (
                          <div className="mt-2">
                            <div className="bg-gray-50 border border-slate-200 rounded p-2">
                              <div className="flex items-center">
                                <span className="text-gray-500 mr-2 font-bold text-xs">○</span>
                                <span className="text-gray-600 text-xs font-medium">
                                  No assignments upcoming
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      )}

                      {nurse.leaveInfo && (
                        <div className="mt-2">
                          <div className="bg-gray-100 border-l-4 border-black rounded p-3">
                            <div className="flex items-center mb-2">
                              <span className="text-black mr-2 font-bold text-sm">⏸</span>
                              <span className="font-semibold text-black text-sm">On Leave</span>
                            </div>
                            
                            <div className="text-xs text-black ml-5">
                              <div className="mb-1">
                                <span className="font-medium">From:</span> {formatDate(nurse.leaveInfo.startDate)}
                                {nurse.leaveInfo.endDate && (
                                  <span className="ml-3">
                                    <span className="font-medium">To:</span> {formatDate(nurse.leaveInfo.endDate)}
                                  </span>
                                )}
                              </div>
                              
                              {nurse.leaveInfo.reason && (
                                <div>
                                  <span className="font-medium">Reason:</span> {nurse.leaveInfo.reason}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </NurseCard>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isLoading && totalPages > 0 && renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default NurseListModal;