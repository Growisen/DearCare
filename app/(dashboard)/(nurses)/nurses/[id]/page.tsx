"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  fetchNurseAssignments, 
  fetchNurseDetailsmain, 
  NurseAssignmentWithClient, 
  SimplifiedNurseDetails, 
  deleteNurse 
} from '@/app/actions/staff-management/add-nurse';
import ProfileHeader from '@/components/nurseProfile/ProfileHeader';
import TabNavigation from '@/components/nurseProfile/TabNavigation';
import ProfileContent from '@/components/nurseProfile/ProfileContent';
import AssignmentsContent from '@/components/nurseProfile/AssignmentsContent';
import AnalyticsContent from '@/components/nurse/NursePerformanceAnalytics'; 
import SalaryDetails from '@/components/nurse/SalaryDetails';
import AdvancePayments from '@/components/nurse/advancePayments/AdvancePayments';
import ProfileSkeletonLoader from '@/components/ProfileSkeletonLoader';

const NurseProfilePage: React.FC = () => {
  const params = useParams();
  const [nurse, setNurse] = useState<SimplifiedNurseDetails | null>(null)
  const [assignments, setAssignments] = useState<NurseAssignmentWithClient[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'assignments' | 'analytics' | 'salaryDetails' | 'advancePayments'>('profile')
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)

  useEffect(() => {
    async function loadDetails() {
      if (!params.id) return

      setLoading(true)
      try {
        const nurseResponse = await fetchNurseDetailsmain(Number(params.id))
        if (nurseResponse.error) {
          setError(nurseResponse.error)
          return
        }
        setNurse(nurseResponse.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    loadDetails()
  }, [params.id])

  useEffect(() => {
    async function loadAssignments() {
      if (!params.id || assignments || activeTab !== 'assignments') return
      setAssignmentsLoading(true)
      try {
        const assignmentsResponse = await fetchNurseAssignments(Number(params.id))
        if (assignmentsResponse.error) {
          console.error('Error fetching assignments:', assignmentsResponse.error)
        }
        setAssignments(assignmentsResponse.data)
      } catch {
        console.error('Error fetching assignments:')
      } finally {
        setAssignmentsLoading(false)
      }
    }
    loadAssignments()
  }, [activeTab, params.id, assignments])

  const calculateAge = (dateOfBirth: string | null): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDelete = async () => {
    if (!params.id) return;
    if (!confirm('Are you sure you want to delete this nurse? This action cannot be undone.')) return;
    try {
      const response = await deleteNurse(Number(params.id));
      if (response?.error) throw new Error(response.error);
      window.location.href = '/nurses';
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete nurse');
    }
  };

  if (loading) return <ProfileSkeletonLoader />
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!nurse) return <div className="p-4">No nurse found</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-1">
      <div className="max-w-[100%]">
        <div className="bg-white rounded-sm shadow-none overflow-hidden mb-4">
          <ProfileHeader nurse={nurse} onDelete={handleDelete} />

          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-0">
            {activeTab === 'profile' ? (
              <ProfileContent nurse={nurse} calculateAge={calculateAge} />
            ) : activeTab === 'assignments' ? (
              <AssignmentsContent 
                assignments={assignments} 
                loading={assignmentsLoading} 
              />
            ) : activeTab === 'analytics' ? (
              <AnalyticsContent nurseId={Number(params.id)} />
            ) : activeTab === 'salaryDetails' ? (
              <SalaryDetails nurseId={Number(params.id)} />
            ) : activeTab === 'advancePayments' ? (
              <AdvancePayments nurseId={Number(params.id)} tenant={nurse.basic.admitted_type ?? ""} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseProfilePage;