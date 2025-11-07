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

import { usePatientData } from '@/hooks/usePatientData';
import { useNurseAssignments } from '@/hooks/useNurseAssignments';
import { useTabManagement } from '@/hooks/useTabManagement';
import { useModalManagement } from '@/hooks/useModalManagement';
import { useClientFiles } from '@/hooks/useClientFiles';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAssignmentData } from '@/hooks/useAssignmentData';

const PatientProfilePage = () => {
  const { invalidateDashboardCache } = useDashboardData()
  const { invalidateAssignmentsCache } = useAssignmentData()
  const params = useParams();
  const id = params.id as string;
  const { activeTab, handleTabChange } = useTabManagement(id);


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
  });
  
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
  } = useNurseAssignments(id, activeTab);

  const {
    files,
    loading: isLoadingFiles,
    uploadFiles,
    deleteFile
  } = useClientFiles(id, activeTab === 'files');

  
  const { showDeleteConfirmation, setShowDeleteConfirmation } = useModalManagement();

  if (loading) {
    return <ProfileSkeletonLoader />;
  }

  if (error || !patient) {
    return <ProfileError error={error} />;
  }

  const latestAssessment = patient.assessments[0];

  const handleDeleteConfirmation = async () => {
    const success = await handleDeleteClient();
    if (success) {
      window.location.href = '/clients';
    } else {
      setShowDeleteConfirmation(false);
    }
  };

  console.log("adas", nurseAssignments);

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

          <div className="border-b border-gray-200 px-3 sm:px-6">
            <div className="overflow-x-auto pb-1">
              <nav className="-mb-px flex space-x-2 sm:space-x-8">
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Details
                </button>
                <button
                  onClick={() => handleTabChange('medical')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'medical'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Medical Info
                </button>

                <button
                  onClick={() => handleTabChange('files')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'files'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Files
                </button>
                {status === 'approved' && (
                  <>
                    <button
                      onClick={() => handleTabChange('assignments')}
                      className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === 'assignments'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Nurse Assignments
                    </button>

                    <button
                      onClick={() => handleTabChange('paymentDetails')}
                      className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === 'paymentDetails'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Payment Details
                    </button>
                  </>
                )}
              </nav>
            </div>
          </div>
          
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
                  <MedicalInfo assessment={latestAssessment} />
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
                  <h2 className="text-lg font-semibold text-gray-800">Nurse Assignments</h2>
                  <button
                    onClick={handleOpenNurseList}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Assign New Nurse
                  </button>
                </div>
                {isLoadingAssignments ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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