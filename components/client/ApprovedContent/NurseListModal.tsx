import React, { useState } from 'react';
import { Nurse } from '@/types/staff.types';
import NurseCard from './NurseCard';

interface NurseListModalProps {
  isOpen: boolean;
  nurses: Nurse[];
  onClose: () => void;
  onAssignNurse: (nurseId: string) => void;
  onViewProfile: (nurse: Nurse) => void;
}

const NurseListModal: React.FC<NurseListModalProps> = ({
  isOpen,
  nurses,
  onClose,
  onAssignNurse,
  onViewProfile
}) => {
  const [activeTab, setActiveTab] = useState('available');

  if (!isOpen) return null;

  const availableNurses = nurses.filter(n => n.status === 'unassigned');
  const assignedNurses = nurses.filter(n => n.status === 'assigned');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Nurse Assignment</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'available' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('available')}
          >
            Available Nurses
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'assigned' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('assigned')}
          >
            Assigned Nurses
          </button>
        </div>

        {activeTab === 'available' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              {availableNurses.length} available nurses
            </p>
            {availableNurses.map((nurse) => (
              <NurseCard 
                key={nurse._id}
                nurse={nurse}
                onAssign={(nurse) => onAssignNurse(nurse._id)}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        )}

        {activeTab === 'assigned' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              {assignedNurses.length} assigned nurses
            </p>
            {assignedNurses.map((nurse) => (
              <NurseCard 
                key={nurse._id}
                nurse={nurse}
                onAssign={(nurse) => onAssignNurse(nurse._id)}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseListModal;