"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Loader from '@/components/Loader'
import { fetchNurseAssignments, fetchNurseDetailsmain, NurseAssignmentWithClient, SimplifiedNurseDetails } from '@/app/actions/add-nurse';
import Link from 'next/link';

const NurseProfilePage: React.FC = () => {
  const params = useParams()
  const [nurse, setNurse] = useState<SimplifiedNurseDetails | null>(null)
  const [assignments, setAssignments] = useState<NurseAssignmentWithClient[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'assignments'>('profile')

  useEffect(() => {
    async function loadData() {
      if (!params.id) return

      setLoading(true)
      try {
        // Fetch nurse details and assignments in parallel
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

  // Function to calculate age based on date of birth
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

  if (loading) return <Loader />
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!nurse) return <div className="p-4">No nurse found</div>

  const basicInfo = nurse.basic;
  const healthInfo = nurse.health;
  const referencesInfo = nurse.references;
  const documentsInfo = nurse.documents;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95%] mx-auto py-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl font-semibold text-gray-800">Nurse Profile</h1>
              <Link 
                href={`/nurses/${basicInfo.nurse_id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </Link>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {documentsInfo.profile_image ? (
                      <Image 
                        src={documentsInfo.profile_image}
                        alt={`${basicInfo.first_name || ''} ${basicInfo.last_name || ''}`}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <div className="text-center text-blue-600 font-semibold text-2xl">
                          {(basicInfo.first_name?.[0] || '') + (basicInfo.last_name?.[0] || '')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center md:text-left mt-3 md:mt-0">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {basicInfo.first_name} {basicInfo.last_name}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {basicInfo.category} • {basicInfo.experience || 0} years experience
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
                    <span className="inline-flex items-center px-3 py-1 bg-white text-sm rounded-full text-gray-700 border border-gray-200 shadow-sm">
                      <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {basicInfo.city}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-white text-sm rounded-full text-gray-700 border border-gray-200 shadow-sm">
                      <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Status: <span className="font-medium capitalize">{basicInfo.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'assignments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('assignments')}
            >
              Assignments
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {activeTab === 'profile' ? (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white p-4 rounded border border-gray-200">
                  <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Basic Info */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Name</p>
                        <p className="text-sm text-gray-700">
                          {basicInfo.first_name} {basicInfo.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Address</p>
                        <p className="text-sm text-gray-700">{basicInfo.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                        <p className="text-sm text-gray-700">{basicInfo.phone_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm text-gray-700">{basicInfo.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Gender</p>
                        <p className="text-sm text-gray-700">{basicInfo.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Marital Status</p>
                        <p className="text-sm text-gray-700">{basicInfo.marital_status}</p>
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">City</p>
                        <p className="text-sm text-gray-700">{basicInfo.city}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">State</p>
                        <p className="text-sm text-gray-700">{basicInfo.state}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">PIN Code</p>
                        <p className="text-sm text-gray-700">{basicInfo.pin_code}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Religion</p>
                        <p className="text-sm text-gray-700">{basicInfo.religion}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Mother Tongue</p>
                        <p className="text-sm text-gray-700">{basicInfo.mother_tongue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Service Type</p>
                        <p className="text-sm text-gray-700">{basicInfo.service_type}</p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Known Languages</p>
                        <p className="text-sm text-gray-700">
                          {Array.isArray(basicInfo.languages)
                            ? basicInfo.languages.join(', ')
                            : typeof basicInfo.languages === 'object' && basicInfo.languages
                            ? Object.values(basicInfo.languages).join(', ')
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Date of Birth</p>
                        <p className="text-sm text-gray-700">
                          {basicInfo.date_of_birth
                            ? new Date(basicInfo.date_of_birth).toLocaleDateString()
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Age</p>
                        <p className="text-sm text-gray-700">
                          {basicInfo.date_of_birth ? calculateAge(basicInfo.date_of_birth) : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Experience</p>
                        <p className="text-sm text-gray-700">{basicInfo.experience} years</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Staff Category</p>
                        <p className="text-sm text-gray-700">{basicInfo.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Shift Pattern</p>
                        <p className="text-sm text-gray-700">{basicInfo.shift_pattern}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-white p-4 rounded border border-gray-200">
                  <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                    Documents
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {documentsInfo.adhar && (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-2 bg-red-50 rounded-lg mr-3">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Aadhar Card</p>
                            <a 
                              href={documentsInfo.adhar} 
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      )}

                      {documentsInfo.ration && (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-2 bg-green-50 rounded-lg mr-3">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Ration Card</p>
                            <a 
                              href={documentsInfo.ration} 
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      )}

                      {documentsInfo.educational && (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-2 bg-blue-50 rounded-lg mr-3">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Educational Certificate</p>
                            <a 
                              href={documentsInfo.educational} 
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      )}

                      {documentsInfo.experience && (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Experience Certificate</p>
                            <a 
                              href={documentsInfo.experience} 
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      )}

                      {documentsInfo.noc && (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="p-2 bg-purple-50 rounded-lg mr-3">
                            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">NOC Certificate</p>
                            <a 
                              href={documentsInfo.noc} 
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* References Section */}
                {referencesInfo && (
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                      References
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Primary Reference
                        </h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Name:</span> {referencesInfo.referer_name}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Relation:</span> {referencesInfo.relation}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Phone:</span> {referencesInfo.phone_number}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Description:</span> {referencesInfo.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {referencesInfo.family_references && (
                        <div>
                          <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Family References
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Array.isArray(referencesInfo.family_references) && referencesInfo.family_references.map((ref, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Name:</span> {ref.name}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Relation:</span> {ref.relation}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Phone:</span> {ref.phone}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Health Information Section */}
                {healthInfo && (
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                      Health Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <h3 className="text-sm font-medium text-gray-700">Current Health Status</h3>
                        </div>
                        <p className="text-sm text-gray-600">{healthInfo.health_status}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="text-sm font-medium text-gray-700">Disability Details</h3>
                        </div>
                        <p className="text-sm text-gray-600">{healthInfo.disability || 'None'}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="text-sm font-medium text-gray-700">Source of Information</h3>
                        </div>
                        <p className="text-sm text-gray-600">{healthInfo.source}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Assignments Tab */
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Current and Past Assignments</h2>
                
                {assignments && assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-800 truncate">
                                {assignment.client.type === 'individual' 
                                  ? assignment.client.details.individual?.patient_name
                                  : assignment.client.details.organization?.organization_name}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                assignment.client.type === 'individual' 
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {assignment.client.type === 'individual' ? 'Individual' : 'Organization'}
                              </span>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center ${
                              new Date(assignment.assignment.start_date) > new Date()
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : !assignment.assignment.end_date 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : new Date(assignment.assignment.end_date) > new Date() 
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {new Date(assignment.assignment.start_date) > new Date() ? (
                                <>
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Not Yet Started
                                </>
                              ) : !assignment.assignment.end_date ? (
                                <>
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Active - Ongoing
                                </>
                              ) : new Date(assignment.assignment.end_date) > new Date() ? (
                                <>
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Active - Ending Soon
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Completed
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Assignment Details */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-3 border-b pb-2">
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Assignment Details
                              </h4>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex">
                                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Start Date:
                                  </span>
                                  <span className="text-sm text-gray-700">
                                    {new Date(assignment.assignment.start_date).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {assignment.assignment.end_date && (
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      End Date:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {new Date(assignment.assignment.end_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                                
                                {assignment.assignment.shift_start_time && (
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Shift Time:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {assignment.assignment.shift_start_time} - {assignment.assignment.shift_end_time}
                                    </span>
                                  </div>
                                )}
                                
                                {assignment.assignment.salary_hour && (
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Hourly Rate:
                                    </span>
                                    <span className="text-sm text-gray-700 font-medium">₹{assignment.assignment.salary_hour}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Client Details */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-3 border-b pb-2">
                                {assignment.client.type === 'individual' ? (
                                  <>
                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Patient Details
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Organization Details
                                  </>
                                )}
                              </h4>
                              
                              {assignment.client.type === 'individual' ? (
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      Patient:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {assignment.client.details.individual?.patient_name}, {assignment.client.details.individual?.patient_age} years
                                    </span>
                                  </div>
                                  
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      Gender:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {assignment.client.details.individual?.patient_gender}
                                    </span>
                                  </div>
                                  
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                      </svg>
                                      Service:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {assignment.client.details.individual?.service_required}
                                    </span>
                                  </div>
                                  
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      Contact:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {assignment.client.details.individual?.requestor_name} ({assignment.client.details.individual?.relation_to_patient})
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      </svg>
                                      Organization:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {assignment.client.details.organization?.organization_name} ({assignment.client.details.organization?.organization_type})
                                    </span>
                                  </div>
                                  
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      Address:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {assignment.client.details.organization?.organization_address}
                                    </span>
                                  </div>
                                  
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      Contact Person:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {assignment.client.details.organization?.contact_person_name} ({assignment.client.details.organization?.contact_person_role})
                                    </span>
                                  </div>
                                  
                                  <div className="flex">
                                    <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      Contact:
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {assignment.client.details.organization?.contact_phone}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
                    <p className="mt-1 text-sm text-gray-500">This nurse has not been assigned to any clients yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseProfilePage;