import React from 'react';

interface TabNavigationProps {
  activeTab: 'profile' | 'assignments' | 'analytics' | 'salaryDetails' | 'advancePayments';
  setActiveTab: (tab: 'profile' | 'assignments' | 'analytics' | 'salaryDetails' | 'advancePayments') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-slate-200">
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
       <button
          onClick={() => setActiveTab('advancePayments')}
          className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            activeTab === 'advancePayments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-slate-200'
          }`}
        >
          Advance Payments
        </button>
    </div>
  );
};

export default TabNavigation;