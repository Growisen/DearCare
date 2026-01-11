import React, { useEffect, useState } from 'react';
import { getNurseProfileAnalytics, NurseAnalytics } from '@/app/actions/staff-management/nurse-profile-analytics';

const ANALYTICS_FIELDS: { label: string; description: string; key: keyof NurseAnalytics }[] = [
  {
    label: 'Total Assignments',
    key: 'totalAssignments',
    description: 'Total Assignments'
  },
  {
    label: 'Working Days',
    key: 'totalWorkingDays',
    description: 'Total days worked.'
  },
  {
    label: 'Leave Days',
    key: 'totalLeaveDays',
    description: 'Total approved leave days.'
  },
  {
    label: 'Late Attendances',
    key: 'lateAttendances',
    description: 'Number of times late for shift.'
  },
  {
    label: 'On-Time Attendances',
    key: 'onTimeAttendances',
    description: 'Number of times arrived on time.'
  },
  {
    label: 'Total Requested Leaves',
    key: 'totalAppliedLeaveRequests',
    description: 'Total leave requests submitted.'
  }
];

const AnalyticsContent: React.FC<{ nurseId: number }> = ({ nurseId }) => {
  const [data, setData] = useState<NurseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await getNurseProfileAnalytics(nurseId);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [nurseId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
      {ANALYTICS_FIELDS.map((field, idx) => (
        <div
          key={idx}
          className="bg-white rounded border border-slate-200 p-5 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-base font-semibold text-gray-900">{field.label}</h3>
            
            <div className="mt-2 h-8 flex items-center">
              {loading ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800">
                  {data ? data[field.key] : 0}
                </p>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-600 mt-4">{field.description}</p>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsContent;