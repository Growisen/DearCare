import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  { id: 'refundPayments', label: 'Refund Payments', requiresApproval: true },
  { id: 'homeMaidPreferences', label: 'Maid Preferences', requiresApproval: true },
  { id: 'babyCarePreferences', label: 'Baby Care', requiresApproval: true },
  { id: 'deliveryCarePreferences', label: 'Delivery Care', requiresApproval: true },
];

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, status, onTabChange }) => {
  const tabNavRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const visibleTabs = useMemo(() => {
    return TAB_CONFIG.filter(tab => !tab.requiresApproval || status === 'approved');
  }, [status]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabNavRef.current) {
      const scrollAmount = 300;
      tabNavRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const checkScrollPosition = () => {
    if (tabNavRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabNavRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const ref = tabNavRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      window.addEventListener('resize', checkScrollPosition);
    }
    return () => {
      if (ref) {
        ref.removeEventListener('scroll', checkScrollPosition);
      }
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [visibleTabs]);

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="relative mx-auto max-w-full px-4 sm:px-6 lg:px-8">

        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-2 pr-8 bg-gradient-to-r from-white via-white/80 to-transparent">
            <button
              type="button"
              className="
                p-2 rounded-full bg-white border border-slate-200 shadow-md 
                text-gray-700 transition-all duration-200
                hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              "
              onClick={() => scrollTabs('left')}
              aria-label="Scroll left"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        <div 
          ref={tabNavRef}
          className="
            flex overflow-x-auto gap-8 
            scrollbar-hide 
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] 
            scroll-smooth snap-x
          "
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  group relative min-w-fit py-4 text-sm font-medium transition-colors duration-200 snap-start outline-none
                  ${isActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'}
                `}
              >
                <span className="relative z-10">{tab.label}</span>
                <span 
                  className={`
                    absolute bottom-0 left-0 h-0.5 w-full bg-blue-600 rounded-t-md transition-all duration-300
                    ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
                  `} 
                />
              </button>
            );
          })}
        </div>

        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pr-2 pl-8 bg-gradient-to-l from-white via-white/80 to-transparent">
            <button
              type="button"
              className="
                p-2 rounded-full bg-white border border-slate-200 shadow-md 
                text-gray-700 transition-all duration-200
                hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              "
              onClick={() => scrollTabs('right')}
              aria-label="Scroll right"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;