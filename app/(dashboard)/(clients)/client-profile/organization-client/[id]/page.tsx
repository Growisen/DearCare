"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Loader from '@/components/loader'
import NurseListModal from '@/components/client/ApprovedContent/NurseListModal'
import ConfirmationModal from '@/components/client/ApprovedContent/ConfirmationModal'
import NurseAssignmentsList from '@/components/client/NurseAssignmentsList'
import { Nurse } from '@/types/staff.types'
import { nurses_test_data, dummyAssignments } from '@/test_data/dummy_data'
import Link from 'next/link'
import CategorySelector from '@/components/client/Profile/CategorySelector'
import { updateClientCategory, getOrganizationClientDetails } from '@/app/actions/client-actions'

// Updated interface to match the Supabase data structure
interface OrganizationClientData {
  id: string
  client_type: string
  client_category: 'DearCare' | 'TataLife'
  status: string
  created_at: string
  general_notes?: string
  details: {
    organization_name: string
    organization_type: string
    contact_person_name: string
    contact_person_role: string
    contact_email: string
    contact_phone: string
    organization_address: string
    start_date?: string
    registration_number?: string
  }
  staffRequirements: Array<{
    id: string
    client_id: string
    staff_type: string
    count: number
    shift_type: string
  }>
}

const OrganizationClientProfile = () => {
  const params = useParams()
  const id = params.id as string
  const [client, setClient] = useState<OrganizationClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNurseList, setShowNurseList] = useState(false)
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [nurses] = useState(nurses_test_data)
  const [nurseAssignments] = useState(dummyAssignments)
  const [isEditing, setIsEditing] = useState(false)

  // Utility function to handle undefined/null values
  const formatValue = (value: string | undefined | null, defaultText = 'Not specified'): string => {
    return value ? value.trim() : defaultText;
  };

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true)
        const result = await getOrganizationClientDetails(id)
        
        if (!result.success) {
          setError(result.error || 'Failed to load organization details')
          return
        }
        
        setClient(result.client as OrganizationClientData)
      } catch (err) {
        setError('Failed to load organization details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchClientData()
    }
  }, [id])

  const handleAssignNurse = async (nurseId: string) => {
    setShowNurseList(false)
    setShowConfirmation(false)
    
    // TODO: Make API call to save assignment
    console.log(`Nurse ${nurseId} assigned to organization ${id}`)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    // TODO: Add API call to save organization data
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // TODO: Reset any edited data to original state
  }

  const handleCategoryChange = async (newCategory: 'DearCare' | 'TataLife') => {
    try {
      setClient(currentClient => {
        if (!currentClient) return null
        return {
          ...currentClient,
          client_category: newCategory
        }
      })
      
      const result = await updateClientCategory(id as string, newCategory)
      
      if (!result.success) {
        setClient(currentClient => {
          if (!currentClient) return null
          return {
            ...currentClient,
            client_category: currentClient.client_category
          }
        })
        
        console.error('Failed to update category:', result.error)
      } else {
        console.log(`Category successfully updated to ${newCategory}`)
      }
    } catch (error) {
      console.error('Failed to update category:', error)
      
      setClient(currentClient => {
        if (!currentClient) return null
        return {
          ...currentClient,
          client_category: currentClient.client_category
        }
      })
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

  // Calculate staff requirements summary
  const staffSummary = {
    total: client.staffRequirements.reduce((sum, staff) => sum + staff.count, 0),
    assigned: nurseAssignments.length // This would ideally come from real data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95%] mx-auto py-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="flex-shrink-0 order-1 md:order-none">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-white shadow-md">
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
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
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
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSave}
                      className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowNurseList(true)}
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Assign Staff
                    </button>
                    <button 
                      onClick={handleEdit}
                      className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
                    >
                      Edit Details
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Staff Assignments Section */}
            <div className="bg-white p-4 rounded border border-gray-200 mt-4 mb-4">
              <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                Staff Assignments
              </h2>
              <NurseAssignmentsList
                assignments={nurseAssignments}
                nurses={nurses}
                onEditAssignment={(assignment) => {
                  console.log('Edit assignment:', assignment)
                }}
                onEndAssignment={(assignmentId) => {
                  console.log('End assignment:', assignmentId)
                }}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Address
                </h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">{formatValue(client.details.organization_address, 'No address provided')}</p>
                </div>
              </div>

              {/* Staff Requirements */}
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

              {/* Additional Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2 border border-gray-200">
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
        </div>
      </div>

      {/* Add the modals */}
      <NurseListModal 
        isOpen={showNurseList}
        nurses={nurses}
        clientId={client.id}
        onClose={() => setShowNurseList(false)}
        onAssignNurse={(nurseId) => {
          const nurse = nurses.find(n => n._id === nurseId);
          if (nurse) {
            setSelectedNurse(nurse);
            setShowConfirmation(true);
          }
        }}
        onViewProfile={() => {}}
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
        onConfirm={() => selectedNurse && handleAssignNurse(selectedNurse._id)}
        onCancel={() => setShowConfirmation(false)}
        confirmText="Confirm Assignment"
      />
    </div>
  )
}

export default OrganizationClientProfile