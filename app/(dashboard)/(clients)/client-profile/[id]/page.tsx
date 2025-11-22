"use client"

import React from 'react';
import { useParams } from 'next/navigation';
import Loader from '@/components/Loader';
import EditProfileModal from '@/components/client/Profile/EditProfileModal';
import ProfileError from '@/components/client/Profile/ProfileError';

declare global {
  interface Window {
    onNurseAssignmentComplete: (() => void) | null;
  }
}

import NurseListModal from '@/components/client/ApprovedContent/NurseListModal';
import ConfirmationModal from '@/components/client/ApprovedContent/ConfirmationModal';
import NurseAssignmentsList from '@/components/client/NurseAssignmentsList';
import ProfileHeader from '@/components/client/Profile/ProfileHeader';
import PatientInfo from '@/components/client/Profile/PatientInfo';
import MedicalInfo from '@/components/client/Profile/MedicalInfo';
import EditPatientModal from '@/components/client/Profile/EditPatientModal';
import ServiceDetailsSection from '@/components/client/Profile/ServiceDetailsSection';
import EditAssignmentModal from '@/components/client/EditAssignmentModal';
import FileSection from '@/components/client/Profile/FilesSection';
import ClientPaymentHistory from '@/components/client/Profile/PaymentDetails'
import ProfileSkeletonLoader from '@/components/ProfileSkeletonLoader';
import ServicePeriodsTab from '@/components/client/Profile/ServicePeriodsTab';
import ProfileTabs from '@/components/client/Profile/ProfileTabs';
import Reassessment from '@/components/client/Profile/Reassessment'; 

import { usePatientData } from '@/hooks/usePatientData';
import { useNurseAssignments } from '@/hooks/useNurseAssignments';
import { useTabManagement } from '@/hooks/useTabManagement';
import { useModalManagement } from '@/hooks/useModalManagement';
import { useClientFiles } from '@/hooks/useClientFiles';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAssignmentData } from '@/hooks/useAssignmentData';
import { useReassessmentForm } from '@/hooks/useReassessment';

const PatientProfilePage = () => {
  const { invalidateDashboardCache } = useDashboardData()
  const { invalidateAssignmentsCache } = useAssignmentData()
  const params = useParams();
  const id = params.id as string;
  const { activeTab, handleTabChange } = useTabManagement(id);
  const [selectedAssessmentId, setSelectedAssessmentId] = React.useState<string | undefined>(undefined);


  React.useEffect(() => {
    window.onNurseAssignmentComplete = () => {
      invalidateDashboardCache()
      invalidateAssignmentsCache()
      setShowNurseList(false);
      if (refetch) {
        refetch();
      }
    };
    
    return () => {
      window.onNurseAssignmentComplete = null;
    };
  }, []);
  
  const {
    patient,
    loading,
    isLoadingAssessment,
    error,
    status,
    isEditing,
    handleEdit,
    isEditingProfile,
    handleSave,
    handleCancel,
    handleCategoryChange,
    handleEditProfile,
    handleCloseProfileEdit,
    handleDeleteClient,
    fetchAssessmentData,
    refetchClientData,
  } = usePatientData(id, activeTab);

  const {
    nurseAssignments,
    nurses,
    isLoadingNurses,
    isLoadingAssignments,
    currentPage,
    totalPages,
    changePage,
    filters,
    totalNurses,
    updateFilters,
    editingAssignment,
    showEditModal,
    showNurseList,
    selectedNurse,
    showConfirmation,
    setShowNurseList,
    handleOpenNurseList,
    setShowConfirmation,
    handleAssignNurse,
    handleEditAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    setShowEditModal,
    setEditingAssignment,
    refetch,
    showEndModal,
    setShowEndModal,
    handleEndAssignment,
    confirmEndAssignment,
    endDate,
    setEndDate,
    endAssignmentNotes,
    setEndAssignmentNotes,
  } = useNurseAssignments(id, activeTab);

  const {
    files,
    loading: isLoadingFiles,
    uploadFiles,
    deleteFile
  } = useClientFiles(id, activeTab === 'files');

  
  const { showDeleteConfirmation, setShowDeleteConfirmation } = useModalManagement();
  const { 
    reassessments, 
    fetchLoading, 
    fetchError, 
    selectedReassessmentId, 
    setSelectedReassessmentId,
    totalReassessments,
  } = useReassessmentForm(id, activeTab);

  if (loading) {
    return <ProfileSkeletonLoader />;
  }

  if (error || !patient) {
    return <ProfileError error={error} />;
  }

  const latestAssessment = patient.assessments[0];
  const totalAssessments = patient.totalAssessments || [];

  const selectedAssessment =
    patient.assessments.find(a => a.id === selectedAssessmentId) || latestAssessment;

  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    fetchAssessmentData(assessmentId);
  };

  const handleDeleteConfirmation = async () => {
    const success = await handleDeleteClient();
    if (success) {
      window.location.href = '/clients';
    } else {
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full pb-2">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3 sm:mb-4">
          <ProfileHeader
            patient={patient}
            status={status}
            isEditing={isEditing}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleCategoryChange={handleCategoryChange}
            setShowNurseList={setShowNurseList}
            onDelete={() => setShowDeleteConfirmation(true)}
            onEditProfile={handleEditProfile}
          />

          <ProfileTabs
            activeTab={activeTab}
            status={status}
            onTabChange={handleTabChange}
          />
          
          <div className="p-3 sm:p-4 md:p-6">
            <EditProfileModal 
              isOpen={isEditingProfile}
              onClose={handleCloseProfileEdit}
              patient={patient}
              onSave={handleSave}
            />

            <EditPatientModal
              isEditing={isEditing}
              clientId={id}
              handleSave={handleSave}
              handleCancel={handleCancel}
              selectedAssessment={selectedAssessmentId}
            />
            
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <ServiceDetailsSection serviceDetails={patient.serviceDetails} />
                <PatientInfo patient={patient} refetchClientData={refetchClientData}/>
              </div>
            )}
            
            {activeTab === 'medical' && (
              <div className="space-y-6">
                {isLoadingAssessment ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader />
                  </div>
                ) : (
                  <MedicalInfo 
                    assessment={selectedAssessment}
                    totalAssessments={totalAssessments}
                    selectedAssessmentId={selectedAssessmentId}
                    onSelectAssessment={handleSelectAssessment}
                  />
                )}
              </div>
            )}

            {activeTab === 'reassessment' && status === 'approved' && (
              <div className="space-y-6">
                {fetchLoading ? (
                  <ProfileSkeletonLoader />
                ) : fetchError ? (
                  <ProfileError error={fetchError} />
                ) : (
                  <Reassessment 
                    reassessments={reassessments} 
                    selectedReassessmentId={selectedReassessmentId} 
                    setSelectedReassessmentId={setSelectedReassessmentId}
                    totalReassessments={totalReassessments}
                  />
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <>
                {isLoadingFiles ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader />
                  </div>
                ) : (
                  <FileSection 
                    clientId={id}
                    files={files}
                    onUpload={uploadFiles}
                    onDelete={deleteFile}
                  />
                )}
              </>
            )}
            
            {activeTab === 'assignments' && status === 'approved' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Assignments</h2>
                  <button
                    onClick={handleOpenNurseList}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    + Assign
                  </button>
                </div>
                {isLoadingAssignments ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg overflow-hidden">
                    <NurseAssignmentsList
                      assignments={nurseAssignments}
                      nurses={nurses}
                      onEditAssignment={handleEditAssignment}
                      onEndAssignment={handleEndAssignment}
                      onDeleteAssignment={handleDeleteAssignment}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'servicePeriods' && (
              <ServicePeriodsTab clientId={id}/>
            )}

            {activeTab === 'paymentDetails' && status === 'approved' && (
              <div className="space-y-6">
                <ClientPaymentHistory clientId={id} />
              </div>
            )}
          </div>
        </div>
      </div>

      <NurseListModal
        isOpen={showNurseList}
        nurses={nurses}
        clientId={id}
        onClose={() => setShowNurseList(false)}
        onAssignNurse={handleAssignNurse}
        onViewProfile={() => {}}
        currentPage={currentPage}
        totalPages={totalPages}
        totalNurses={totalNurses}
        onPageChange={changePage}
        onFilterChange={updateFilters}
        filters={filters}
        isLoading={isLoadingNurses}
      />

      <ConfirmationModal 
        isOpen={showConfirmation}
        title="Confirm Assignment"
        message={
          <p>
            Are you sure you want to assign <span className="font-medium">
              {selectedNurse?.firstName} {selectedNurse?.lastName}
            </span> to this patient?
          </p>
        }
        onConfirm={() => {
          if (selectedNurse) {
            return handleAssignNurse(selectedNurse._id);
          }
          return Promise.resolve();
        }}
        onCancel={() => setShowConfirmation(false)}
        confirmText="Confirm Assignment"
      />

      <EditAssignmentModal
        isOpen={showEditModal}
        assignment={editingAssignment}
        nurse={editingAssignment ? nurses.find(n => n._id === editingAssignment.nurseId) : null}
        onClose={() => {
          setShowEditModal(false);
          setEditingAssignment(null);
        }}
        onSave={handleUpdateAssignment}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Client"
        message={
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-2">Warning: This action cannot be undone!</p>
            <p>Are you sure you want to delete this client?</p>
            <p className="mt-2 text-sm text-gray-600">
              All associated data including assessments and nurse assignments will be permanently removed.
            </p>
          </div>
        }
        onConfirm={handleDeleteConfirmation}
        onCancel={() => setShowDeleteConfirmation(false)}
        confirmText="Delete Client"
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
      />

      <ConfirmationModal
        isOpen={showEndModal}
        title="End Assignment"
        message={
          <div>
            <p>
              Are you sure you want to end this nurse assignment?
            </p>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="border rounded px-2 py-1"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Assignment Notes
              </label>
              <textarea
                className="border rounded px-2 py-1 w-full"
                rows={3}
                value={endAssignmentNotes}
                onChange={e => setEndAssignmentNotes(e.target.value)}
                placeholder="Add notes about ending this assignment..."
              />
            </div>
          </div>
        }
        onConfirm={confirmEndAssignment}
        onCancel={() => setShowEndModal(false)}
        confirmText="End Assignment"
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default PatientProfilePage;