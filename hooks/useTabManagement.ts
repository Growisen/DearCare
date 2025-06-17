import { useState } from 'react';

type TabType = 'profile' | 'medical' | 'assignments' | 'files' | 'requirements';

export const useTabManagement = (id: string) => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(`patient-${id}-activeTab`) as TabType | null;
      if (savedTab === 'profile' || savedTab === 'medical' || savedTab === 'assignments' || savedTab === 'files' || savedTab === 'requirements') {
        return savedTab;
      }
    }
    return 'profile';
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem(`patient-${id}-activeTab`, tab);
  };

  return {
    activeTab,
    handleTabChange
  };
};