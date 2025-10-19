import React, { useEffect, useState } from 'react';
import { getNurseProfileAnalytics, NurseAnalytics } from '@/app/actions/staff-management/nurse-profile-analytics';
import Loader from '../Loader';

interface AnalyticsItem {
  label: string;
  value: string | number;
  description: string;
}

const mapAnalyticsToItems = (data: NurseAnalytics): AnalyticsItem[] => [
  {
    label: 'Total Assignments',
    value: data.totalAssignments,
    description: 'Total Assignments'
  },
  {
    label: 'Working Days',
    value: data.totalWorkingDays,
    description: 'Total days worked.'
  },
  {
    label: 'Leave Days',
    value: data.totalLeaveDays,
    description: 'Total approved leave days.'
  },
  {
    label: 'Late Attendances',
    value: data.lateAttendances,
    description: 'Number of times late for shift.'
  },
  {
    label: 'On-Time Attendances',
    value: data.onTimeAttendances,
    description: 'Number of times arrived on time.'
  },
  {
    label: 'Total Requested Leaves',
    value: data.totalAppliedLeaveRequests,
    description: 'Total leave requests submitted.'
  }
];

const AnalyticsContent: React.FC<{ nurseId: number }> = ({ nurseId }) => {
  const [items, setItems] = useState<AnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      const res = await getNurseProfileAnalytics(nurseId);
      if (res.success && res.data) {
        setItems(mapAnalyticsToItems(res.data));
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, [nurseId]);

  if (loading) return <Loader message='Loading analytics...' />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded border border-gray-300 p-5 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-base font-semibold text-gray-900">{item.label}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{item.value}</p>
          </div>
          <p className="text-xs text-gray-600 mt-4">{item.description}</p>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsContent;