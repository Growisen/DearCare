"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Loader from '@/components/Loader'
import { fetchNurseAssignments, fetchNurseDetailsmain, NurseAssignmentWithClient, SimplifiedNurseDetails, deleteNurse } from '@/app/actions/staff-management/add-nurse';
import ProfileHeader from '@/components/nurseProfile/ProfileHeader';
import TabNavigation from '@/components/nurseProfile/TabNavigation';
import ProfileContent from '@/components/nurseProfile/ProfileContent';
import AssignmentsContent from '@/components/nurseProfile/AssignmentsContent';
import AnalyticsContent from '@/components/nurse/NursePerformanceAnalytics'; 
import SalaryDetails from '@/components/nurse/SalaryDetails';

const NurseProfilePage: React.FC = () => {
  const params = useParams();
  const [nurse, setNurse] = useState<SimplifiedNurseDetails | null>(null)
  const [assignments, setAssignments] = useState<NurseAssignmentWithClient[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'assignments' | 'analytics' | 'salaryDetails'>('profile')

  useEffect(() => {
    async function loadData() {
      if (!params.id) return

      setLoading(true)
      try {
        const [nurseResponse, assignmentsResponse] = await Promise.all([
          fetchNurseDetailsmain(Number(params.id)),
          fetchNurseAssignments(Number(params.id))
        ])
        
        if (nurseResponse.error) {
          setError(nurseResponse.error)
          return
        }

        if (assignmentsResponse.error) {
          console.error('Error fetching assignments:', assignmentsResponse.error)
        }

        setNurse(nurseResponse.data)
        setAssignments(assignmentsResponse.data)

        console.log('Nurse:', nurseResponse.data)
        console.log('Assignments:', assignmentsResponse.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

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

  if (loading) return <Loader />
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!nurse) return <div className="p-4">No nurse found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95%] mx-auto py-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <ProfileHeader nurse={nurse} onDelete={handleDelete} />

          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-6">
            {activeTab === 'profile' ? (
              <ProfileContent nurse={nurse} calculateAge={calculateAge} />
            ) : activeTab === 'assignments' ? (
              <AssignmentsContent assignments={assignments} />
            ) : activeTab === 'analytics' ? (
              <AnalyticsContent nurseId={Number(params.id)} />
            ) : <SalaryDetails nurseId={Number(params.id)}/>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseProfilePage;