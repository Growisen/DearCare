"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Loader from '@/components/Loader'
import NurseListModal from '@/components/client/ApprovedContent/NurseListModal'
import ConfirmationModal from '@/components/client/ApprovedContent/ConfirmationModal'
import NurseAssignmentsList from '@/components/client/NurseAssignmentsList'
import Link from 'next/link'
import CategorySelector from '@/components/client/Profile/CategorySelector'
import { updateClientCategory, deleteClient, updateOrganizationDetails } from '@/app/actions/clients/client-actions'
import EditAssignmentModal from '@/components/client/EditAssignmentModal'
import toast from 'react-hot-toast'
import ImageViewer from '@/components/common/ImageViewer'
import { createMapLink } from '@/utils/mapUtils'
import { ClientCategory } from '@/types/client.types'
import { useNurseAssignments } from '@/hooks/useNurseAssignments'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useTabManagement } from '@/hooks/useTabManagement'
import { useAssignmentData } from '@/hooks/useAssignmentData'
import EditOrganizationDetailsModal from '@/components/client/EditOrganizationDetailsModal'
import { useOrganizationClient } from '@/hooks/useOrganizationClient'
import { logger } from '@/utils/logger'

interface UpdateOrganizationClientData {
  organization_name: string
  contact_person_name: string
  contact_person_role: string
  contact_email: string
  contact_phone: string
  organization_address: string
  organization_state: string
  organization_district: string
  organization_city: string
  organization_pincode: string
}

const OrganizationClientProfile = () => {
  const { invalidateDashboardCache } = useDashboardData()
  const { invalidateAssignmentsCache } = useAssignmentData()
  const params = useParams()
  const id = params.id as string
  
  const {
    client,
    loading,
    error,
    status,
    fetchClientData,
    updateClientData
  } = useOrganizationClient(id)
  
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const {
    nurseAssignments,
    nurses,
    isLoadingNurses,
    editingAssignment,
    showEditModal: showNurseEditModal,
    showNurseList,
    selectedNurse,
    showConfirmation,
    currentPage,
    totalPages,
    totalNurses,
    filters,
    setShowNurseList,
    setShowConfirmation,
    handleAssignNurse,
    handleEditAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    setShowEditModal: setShowNurseEditModal,
    setEditingAssignment,
    changePage,
    updateFilters,
    refetch
  } = useNurseAssignments(id)

  const { activeTab, handleTabChange } = useTabManagement(id);

  const formatValue = (value: string | undefined | null, defaultText = 'Not specified'): string => {
    return value ? value.trim() : defaultText
  }

  useEffect(() => {
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

  const handleSave = async (updatedData: { details: UpdateOrganizationClientData, general_notes?: string }) => {
    try {
      const result = await updateOrganizationDetails(id, updatedData);
      
      if (result.success) {
        fetchClientData();
        refetch();
        toast.success('Organization details updated successfully');
        setShowEditModal(false);
      } else {
        toast.error(`Failed to update details: ${result.error}`);
      }
    } catch (error) {
      logger.debug('Error updating organization:', error);
      toast.error('Failed to update organization details');
    }
  };

  const handleCategoryChange = async (newCategory: ClientCategory) => {
    try {
      if (client) {
        const updatedClient = {
          ...client,
          client_category: newCategory
        };
        updateClientData(updatedClient);
      }
      
      const result = await updateClientCategory(id as string, newCategory)
      
      if (!result.success) {
        fetchClientData();
        logger.error('Failed to update category')
      } else {
        logger.debug(`Category successfully updated to ${newCategory}`)
      }
    } catch {
      logger.error('Failed to update category:')
      fetchClientData();
    }
  }

  const handleDeleteClient = async () => {
    try {
      const result = await deleteClient(id as string)
      if (result.success) {
        invalidateDashboardCache()
        toast.success('Organization deleted successfully')
        window.location.href = '/clients'
      } else {
        toast.error('Failed to delete organization')
        logger.debug('Failed to delete organization', result.error);
        setShowDeleteConfirmation(false)
      }
    } catch (error) {
      logger.debug('Error deleting organization:', error)
      toast.error('An error occurred while deleting the organization')
      setShowDeleteConfirmation(false)
    }
  }

  if (loading) return <Loader />

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-md shadow">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-red-700">Error Loading Profile</h1>
            <p className="mt-2 text-gray-600">{error || "Organization profile not found"}</p>
            <Link href="/clients" className="mt-4 inline-block text-indigo-600 hover:underline">
              Return to Clients
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const organizationMapLink = createMapLink({
    fullAddress: client?.details?.organization_address,
    city: client?.details?.organization_city,
    district: client?.details?.organization_district,
    state: client?.details?.organization_state,
    pincode: client?.details?.organization_pincode
  })

  const staffSummary = {
    total: client.staffRequirements.reduce((sum, staff) => sum + staff.count, 0),
    assigned: nurseAssignments.length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95%] mx-auto py-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gray-100 border-b border-gray-200 px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0 order-1 md:order-none">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer"
                      onClick={() => setIsImageViewerOpen(true)}>
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-600 font-medium text-xl">
                        <div>{(client.details.organization_name || 'N/A').charAt(0)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-semibold text-gray-800">
                    {formatValue(client.details.organization_name)}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {formatValue(client.details.organization_type)}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start mt-4 gap-3">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                      <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {client.details.organization_address 
                        ? client.details.organization_address.split(',').slice(-2).join(',')
                        : 'Address not specified'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                      Status: <span className={`ml-1 ${
                        client.status === 'approved' ? 'text-green-700' : 
                        client.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        {(client.status || 'pending').toUpperCase()}
                      </span>
                    </span>
                    <CategorySelector 
                      currentCategory={client.client_category}
                      onCategoryChange={handleCategoryChange}
                    />
                  </div>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                  Edit Organization
                </button>
                <button 
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                >
                  Delete Organization
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-4 sm:px-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide whitespace-nowrap">
              <button
                onClick={() => handleTabChange('profile')}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="inline-block">Organization Details</span>
              </button>
              <button
                onClick={() => handleTabChange('requirements')}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                  activeTab === 'requirements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="inline-block">Staff Requirements</span>
              </button>
              {status === 'approved' && (
                <button
                  onClick={() => handleTabChange('assignments')}
                  className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                    activeTab === 'assignments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="inline-block">Staff Assignments</span>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content - Details and Requirements tabs remain the same */}
        <div className="p-4 sm:p-6">
          {/* Organization Details Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Same as before - Details content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  {/* Same as before */}
                  <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-200 mb-3">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-700 font-medium">Contact Person</p>
                      <p className="font-medium text-gray-900">{formatValue(client.details.contact_person_name)}</p>
                      <p className="text-sm text-gray-900">{formatValue(client.details.contact_person_role)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 font-medium">Contact Details</p>
                      <p className="text-gray-900">{formatValue(client.details.contact_email, 'Email not provided')}</p>
                      <p className="text-gray-900">{formatValue(client.details.contact_phone, 'Phone not provided')}</p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  {/* Address content remains the same */}
                  <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                    Address
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-1">Full Address</p>
                        <p className="text-sm text-gray-900 break-words">{formatValue(client.details.organization_address, 'No address provided')}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7m10 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">City</p>
                          <p className="text-sm text-gray-900 font-medium">{formatValue(client.details.organization_city, 'Not specified')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">District</p>
                          <p className="text-sm text-gray-900 font-medium">{formatValue(client.details.organization_district, 'Not specified')}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">State</p>
                          <p className="text-sm text-gray-900 font-medium">{formatValue(client.details.organization_state, 'Not specified')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">PIN Code</p>
                          <p className="text-sm text-gray-900 font-medium">{formatValue(client.details.organization_pincode, 'Not specified')}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-3 border-t border-gray-100">
                      <a href={organizationMapLink || '#'} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Additional Notes */}
                <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2 border border-gray-200">
                  {/* Additional notes content remains the same */}
                  <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                    Additional Information
                  </h2>
                  <div>
                    <p className="text-sm text-gray-900">{formatValue(client.general_notes, 'No additional notes available.')}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Created: {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'Date not recorded'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Client ID: {formatValue(client.id)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Requirements Tab */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Staff Requirements
                </h2>
                {client.staffRequirements && client.staffRequirements.length > 0 ? (
                  <div className="space-y-4">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500">
                          <th className="pb-2">Staff Type</th>
                          <th className="pb-2">Count</th>
                          <th className="pb-2">Shift</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {client.staffRequirements.map((req, idx) => (
                          <tr key={idx}>
                            <td className="py-2 text-gray-900">{formatValue(req.staff_type)}</td>
                            <td className="py-2 text-gray-900">{req.count || 0}</td>
                            <td className="py-2 text-gray-900">{formatValue(req.shift_type)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        Start Date: {client.details.start_date 
                          ? new Date(client.details.start_date).toLocaleDateString() 
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No staff requirements specified</p>
                )}
              </div>

              {/* Staff Statistics */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Staff Statistics
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{staffSummary.total}</p>
                    <p className="text-xs text-gray-500">Required</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{staffSummary.assigned}</p>
                    <p className="text-xs text-gray-500">Assigned</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Assignments Tab - Updated to use hook's state and functions */}
          {activeTab === 'assignments' && status === 'approved' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Staff Assignments</h2>
                <button
                  onClick={() => setShowNurseList(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Assign New Staff
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
        </div>
      </div>
      
      <ImageViewer
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.details.organization_name || 'N/A')}&background=random`}
        alt={client.details.organization_name || 'Organization Logo'}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />

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
          <p className="text-gray-900">
            Are you sure you want to assign <span className="font-medium">
              {selectedNurse ? `${selectedNurse.firstName || ''} ${selectedNurse.lastName || ''}` : 'the selected staff member'}
            </span> to this organization?
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
        isOpen={showNurseEditModal}
        assignment={editingAssignment}
        nurse={editingAssignment ? nurses.find(n => n._id === editingAssignment.nurseId) : null}
        onClose={() => {
          setShowNurseEditModal(false);
          setEditingAssignment(null);
        }}
        onSave={handleUpdateAssignment}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Organization"
        message={
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-2">Warning: This action cannot be undone!</p>
            <p>Are you sure you want to delete this organization?</p>
            <p className="mt-2 text-sm text-gray-600">
              All associated data including staff requirements and nurse assignments will be permanently removed.
            </p>
          </div>
        }
        onConfirm={handleDeleteClient}
        onCancel={() => setShowDeleteConfirmation(false)}
        confirmText="Delete Organization"
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
      />

      <EditOrganizationDetailsModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        organizationData={client ? {
          details: client.details,
          general_notes: client.general_notes
        } : null}
      />
    </div>
  )
}

export default OrganizationClientProfile