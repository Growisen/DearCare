import React, { useMemo } from 'react';
import { TabType } from '@/hooks/useTabManagement';

export interface ProfileTabsProps {
  activeTab: TabType;
  status: string;
  onTabChange: (tab: TabType) => void;
}

const TAB_CONFIG: { id: TabType; label: string; requiresApproval?: boolean }[] = [
  { id: 'profile', label: 'Profile Details' },
  { id: 'medical', label: 'Assessment Info' },
  { id: 'reassessment', label: 'Reassessment', requiresApproval: true },
  { id: 'files', label: 'Files' },
  { id: 'assignments', label: 'Assignments', requiresApproval: true },
  { id: 'servicePeriods', label: 'Service Periods', requiresApproval: true },
  { id: 'paymentDetails', label: 'Payment Details', requiresApproval: true },
  { id: 'homeMaidPreferences', label: 'Home Maid Preferences', requiresApproval: true },
  { id: 'babyCarePreferences', label: 'Baby Care Preferences', requiresApproval: true },
  { id: 'deliveryCarePreferences', label: 'Delivery Care Preferences', requiresApproval: true },
];

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, status, onTabChange }) => {

  const visibleTabs = useMemo(() => {
    return TAB_CONFIG.filter(tab => !tab.requiresApproval || status === 'approved');
  }, [status]);

  return (
    <>
      <div className="border-b border-gray-200 px-3 sm:px-6">
        <div className="overflow-x-auto pb-1 slim-scrollbar">
          <nav className="-mb-px flex space-x-4 sm:space-x-6">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    whitespace-nowrap border-b-2 py-3 px-1 text-xs font-medium transition-colors duration-200 sm:text-sm
                    ${isActive 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default ProfileTabs;