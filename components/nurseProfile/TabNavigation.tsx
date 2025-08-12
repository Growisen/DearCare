import React from 'react';

interface TabNavigationProps {
  activeTab: 'profile' | 'assignments' | 'analytics' | 'salaryDetails';
  setActiveTab: (tab: 'profile' | 'assignments' | 'analytics' | 'salaryDetails') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-gray-200">
      <button
        className={`px-6 py-3 text-sm font-medium ${
          activeTab === 'profile'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('profile')}
      >
        Profile
      </button>
      <button
        className={`px-6 py-3 text-sm font-medium ${
          activeTab === 'assignments'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('assignments')}
      >
        Assignments
      </button>

      <button
        className={`px-6 py-3 text-sm font-medium ${
          activeTab === 'analytics'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('analytics')}
      >
        Analytics
      </button>

      <button
        className={`px-6 py-3 text-sm font-medium ${
          activeTab === 'salaryDetails'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('salaryDetails')}
      >
        Salary Details
      </button>
    </div>
  );
};

export default TabNavigation;