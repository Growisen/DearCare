"use client"

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/Loader';
import EditProfileModal from '@/components/client/Profile/EditProfileModal';

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

// Custom hooks
import { usePatientData } from '@/hooks/usePatientData';
import { useNurseAssignments } from '@/hooks/useNurseAssignments';
import { useTabManagement } from '@/hooks/useTabManagement';
import { useModalManagement } from '@/hooks/useModalManagement';
import { useClientFiles } from '@/hooks/useClientFiles';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAssignmentData } from '@/hooks/useAssignmentData';

import { logger } from '@/utils/logger';

const PatientProfilePage = () => {
  const { invalidateDashboardCache } = useDashboardData()
  const { invalidateAssignmentsCache } = useAssignmentData()
  const params = useParams();
  const id = params.id as string;


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
  
  // Use our custom hooks
  const {
    patient,
    loading,
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
    handleDeleteClient
  } = usePatientData(id);

  const {
    nurseAssignments,
    nurses,
    isLoadingNurses,
    currentPage,
    totalPages,
    changePage,
    filters,
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
    refetch
  } = useNurseAssignments(id);

  const {
    files,
    uploadFiles,
    deleteFile
  } = useClientFiles(id);

  const { activeTab, handleTabChange } = useTabManagement(id);
  
  const { showDeleteConfirmation, setShowDeleteConfirmation } = useModalManagement();

  if (loading) {
    return <Loader skeleton={true}/>;
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-md shadow">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-red-700">Error Loading Profile</h1>
            <p className="mt-2 text-gray-600">{error || "Patient profile not found"}</p>
            <Link href="/" className="inline-block text-indigo-600 hover:underline mt-4">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[98%] sm:max-w-[95%] lg:max-w-[1200px] mx-auto py-2 sm:py-4">
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

          {/* Tabs Navigation */}
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
                {/* Add the Files tab button */}
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
          
          {/* Main Content */}
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
            
            {/* Tab Content */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <ServiceDetailsSection serviceDetails={patient.serviceDetails} />
                <PatientInfo patient={patient} />
              </div>
            )}
            
            {activeTab === 'medical' && (
              <div className="space-y-6">
                <MedicalInfo assessment={latestAssessment} />
              </div>
            )}

            {/* Add the Files tab content */}
            {activeTab === 'files' && (
              <FileSection 
                clientId={id}
                files={files}
                onUpload={uploadFiles}
                onDelete={deleteFile}
              />
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
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <NurseAssignmentsList
                    assignments={nurseAssignments}
                    nurses={nurses}
                    onEditAssignment={handleEditAssignment}
                    onEndAssignment={(assignmentId) => {
                      logger.debug('End assignment:', assignmentId);
                    }}
                    onDeleteAssignment={handleDeleteAssignment}
                  />
                </div>
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

      {/* Modals */}
      {/* <NurseListModal 
        isOpen={showNurseList}
        nurses={nurses}
        clientId={id}
        onClose={() => setShowNurseList(false)}
        onAssignNurse={(nurseId) => {
          const nurse = nurses.find(n => n._id === nurseId);
          if (nurse) {
            setSelectedNurse(nurse);
            setShowConfirmation(true);
          }
        }}
        onViewProfile={() => {}}
      /> */}

      <NurseListModal
        isOpen={showNurseList}
        nurses={nurses}
        clientId={id}
        onClose={() => setShowNurseList(false)}
        onAssignNurse={handleAssignNurse}
        onViewProfile={() => {}}
        currentPage={currentPage}
        totalPages={totalPages}
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
    </div>
  );
};

export default PatientProfilePage;