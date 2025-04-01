"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Loader from '@/components/loader'

interface Review {
  id: string;
  text: string;
  date: string;
  rating: number;
  reviewer: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Certification {
  name: string;
  issuedBy: string;
  year: string;
  expiryYear: string;
}

interface WorkHistory {
  organization: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Availability {
  days: string[];
  shifts: string[];
}

interface Skill {
  name: string;
  proficiency: 'Expert' | 'Advanced' | 'Intermediate';
}

interface Reference {
  name: string;
  relation: string;
  phoneNumber: string;
}

interface Nurse {
  _id: string;
  firstName: string;
  lastName: string;
  location: string;
  status: 'assigned' | 'unassigned';
  email: string;
  phoneNumber: string;
  gender: string;
  dob: string;
  salaryPerHour: number;
  salaryCap: number;
  hiringDate: string;
  experience: number;
  rating: number;
  reviews: Review[];
  preferredLocations: string[];
  education?: Education[];
  specializations?: string[];
  languages?: string[];
  certifications?: Certification[];
  workHistory?: WorkHistory[];
  availability?: Availability;
  skills?: Skill[];
  profileImage?: string;
  address: string;
  city: string;
  taluk: string;
  pinCode: string;
  maritalStatus: 'Single' | 'Married' | 'Widow' | 'Separated';
  religion: 'Hindu' | 'Christian' | 'Muslim';
  state: string;
  motherTongue: string;
  nocCertificate: 'Yes' | 'No' | 'Applied' | 'Going To Apply';
  documents?: {
    aadhar?: { path: string; name: string };
    rationCard?: { path: string; name: string };
    educationalQualification?: { path: string; name: string }[];
    workExperience?: { path: string; name: string }[];
    nocCertificate?: { path: string; name: string };
  };
  serviceType: 'Home Nurse' | 'Delivery Care' | 'Baby Care' | 'HM';
  shiftingPattern: '24 Hour' | '12 Hour' | '8 Hour' | 'Hourly';
  hoursIfHourly?: number;
  staffCategory: 'Permanent' | 'Trainee' | 'Temporary';
  primaryReference: Reference;
  familyReferences: Reference[];
  healthStatus: string;
  disabilityDetails: string;
  sourceOfInformation: string;
}

const NurseProfilePage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const fromNurseList = searchParams.get('fromNurseList') === 'true';
  const id = params.id;
  const [nurse, setNurse] = useState<Nurse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setTimeout(() => {
        const mockNurse: Nurse = {
          _id: id as string,
          firstName: "Anjali",
          lastName: "Menon",
          location: "Kochi",
          status: "unassigned",
          email: "anjali.menon@example.com",
          phoneNumber: "123-456-7890",
          gender: "Female",
          dob: "1990-01-01",
          salaryPerHour: 900,
          salaryCap: 1200,
          hiringDate: "2020-01-01",
          experience: 5,
          rating: 4.5,
          reviews: [
            { id: "r1", text: "Great nurse! Was very attentive and professional during my recovery. Helped me with my daily exercises and made sure I was taking my medication correctly.", date: "2021-01-01", rating: 5, reviewer: "John Doe" },
            { id: "r2", text: "Very professional and knowledgeable. Made me feel comfortable during a difficult time.", date: "2021-06-15", rating: 4, reviewer: "Jane Smith" },
            { id: "r3", text: "Excellent caregiver. Always punctual and thorough in their work.", date: "2022-03-22", rating: 5, reviewer: "Raj Kumar" }
          ],
          preferredLocations: ["Kollam", "Palakkad", "Malappuram"],
          education: [
            { degree: "BSc Nursing", institution: "Kerala University of Health Sciences", year: "2015" },
            { degree: "Critical Care Certification", institution: "Indian Nursing Council", year: "2017" }
          ],
          specializations: ["Geriatric Care", "Post-Surgical Care", "Diabetes Management"],
          languages: ["Malayalam", "English", "Hindi", "Tamil"],
          certifications: [
            { name: "Basic Life Support (BLS)", issuedBy: "American Heart Association", year: "2019", expiryYear: "2022" },
            { name: "Advanced Cardiac Life Support", issuedBy: "Indian Resuscitation Council", year: "2020", expiryYear: "2023" }
          ],
          workHistory: [
            { 
              organization: "Kerala Medical Center", 
              position: "Staff Nurse", 
              startDate: "2015-06-01", 
              endDate: "2018-05-30",
              description: "Worked in general medicine ward handling patient care and medication administration."
            },
            { 
              organization: "Lakeshore Hospital", 
              position: "Senior Nurse", 
              startDate: "2018-06-15", 
              endDate: "2020-01-15",
              description: "Specialized in post-operative care and patient recovery monitoring."
            }
          ],
          availability: {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            shifts: ["Morning", "Evening"]
          },
          skills: [
            { name: "Wound Dressing", proficiency: "Expert" },
            { name: "IV Management", proficiency: "Expert" },
            { name: "Medication Administration", proficiency: "Expert" },
            { name: "Vital Signs Monitoring", proficiency: "Expert" },
            { name: "Patient Assessment", proficiency: "Advanced" },
            { name: "Diabetes Management", proficiency: "Advanced" },
            { name: "Elderly Care", proficiency: "Advanced" },
            { name: "Patient Education", proficiency: "Intermediate" }
          ],
          address: "123 Medical Avenue",
          city: "Kochi",
          taluk: "Ernakulam",
          pinCode: "682001",
          maritalStatus: "Single",
          religion: "Hindu",
          state: "Kerala",
          motherTongue: "Malayalam",
          nocCertificate: "Yes",
          documents: {
            aadhar: {
              path: "/documents/aadhar.pdf",
              name: "Aadhar_Card_2023.pdf"
            },
            rationCard: {
              path: "/documents/ration.pdf",
              name: "Ration_Card_2023.pdf"
            },
            educationalQualification: [
              { path: "/documents/degree.pdf", name: "BSc_Nursing_Degree.pdf" },
              { path: "/documents/certificate.pdf", name: "Critical_Care_Certificate.pdf" }
            ],
            workExperience: [
              { path: "/documents/experience1.pdf", name: "Kerala_Medical_Experience.pdf" }
            ],
            nocCertificate: {
              path: "/documents/noc.pdf",
              name: "NOC_Certificate_2023.pdf"
            }
          },
          serviceType: 'Home Nurse',
          shiftingPattern: '12 Hour',
          staffCategory: 'Permanent',
          primaryReference: {
            name: "John Thomas",
            relation: "Uncle",
            phoneNumber: "9876543210"
          },
          familyReferences: [
            {
              name: "Mary Joseph",
              relation: "Sister",
              phoneNumber: "9876543211"
            },
            {
              name: "George Philip",
              relation: "Brother",
              phoneNumber: "9876543212"
            }
          ],
          healthStatus: "Good physical and mental health. No chronic conditions.",
          disabilityDetails: "None",
          sourceOfInformation: "Direct Interview and Family Members"
        };
        
        setNurse(mockNurse);
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  if (loading) {
    return (
      <Loader />
    );
  }

  if (error || !nurse) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-md shadow">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-red-700">Error Loading Profile</h1>
            <p className="mt-2 text-gray-600">{error || "Nurse profile not found"}</p>
            <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95%] mx-auto py-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl font-semibold text-gray-800">Nurse Profile</h1>
              {fromNurseList && (
                <Link 
                  href={`/nurses/${nurse._id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </Link>
              )}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="flex-shrink-0 order-1 md:order-none">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {nurse.profileImage ? (
                      <Image 
                        src={nurse.profileImage}
                        alt={`${nurse.firstName} ${nurse.lastName}`}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <div className="text-center text-blue-600 font-semibold text-2xl">
                          {nurse.firstName[0]}{nurse.lastName[0]}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold text-gray-900">{nurse.firstName} {nurse.lastName}</h1>
                  <p className="text-sm text-gray-600 mt-1">Registered Nurse • {nurse.experience} years experience</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
                    <span className="inline-flex items-center px-3 py-1 bg-white text-sm rounded-full text-gray-700 border border-gray-200 shadow-sm">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold">{nurse.rating}</span>
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-white text-sm rounded-full text-gray-700 border border-gray-200 shadow-sm">
                      <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {nurse.location}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-white text-sm rounded-full text-gray-700 border border-gray-200 shadow-sm">
                      <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">₹{nurse.salaryPerHour}</span>/hr
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Top grid with info sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded border border-gray-200 lg:col-span-3">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Name</p>
                      <p className="text-sm text-gray-700">{nurse.firstName} {nurse.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Address</p>
                      <p className="text-sm text-gray-700">{nurse.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                      <p className="text-sm text-gray-700">{nurse.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-700">{nurse.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Gender</p>
                      <p className="text-sm text-gray-700">{nurse.gender}</p>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">City</p>
                      <p className="text-sm text-gray-700">{nurse.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Taluk</p>
                      <p className="text-sm text-gray-700">{nurse.taluk}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">PIN Code</p>
                      <p className="text-sm text-gray-700">{nurse.pinCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">State</p>
                      <p className="text-sm text-gray-700">{nurse.state}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Religion</p>
                      <p className="text-sm text-gray-700">{nurse.religion}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Preferred Locations</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {nurse.preferredLocations.map((location, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-blue-50 text-xs text-blue-700 rounded-md"
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Mother Tongue</p>
                      <p className="text-sm text-gray-700">{nurse.motherTongue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Known Languages</p>
                      <p className="text-sm text-gray-700">{nurse.languages?.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Date of Birth</p>
                      <p className="text-sm text-gray-700">{new Date(nurse.dob).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Age</p>
                      <p className="text-sm text-gray-700">{Math.floor((new Date().getTime() - new Date(nurse.dob).getTime()) / 3.15576e+10)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Hiring Date</p>
                      <p className="text-sm text-gray-700">{new Date(nurse.hiringDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Staff Category</p>
                      <p className="text-sm text-gray-700">{nurse.staffCategory}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Shifting Pattern</p>
                      <p className="text-sm text-gray-700">{nurse.shiftingPattern}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">NOC Certificate</p>
                      <p className="text-sm text-gray-700">{nurse.nocCertificate}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-gray-200 lg:col-span-3">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">Documents</h2>
                <div className="space-y-6">
                  {/* Identification Documents */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Identification Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nurse.documents?.aadhar && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-50 rounded-lg">
                              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Aadhar Card</p>
                              <p className="text-xs text-gray-500">{nurse.documents.aadhar.name}</p>
                            </div>
                          </div>
                          <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-full border border-blue-100 hover:bg-blue-50 transition-colors">
                            Preview
                          </button>
                        </div>
                      )}

                      {nurse.documents?.rationCard && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Ration Card</p>
                              <p className="text-xs text-gray-500">{nurse.documents.rationCard.name}</p>
                            </div>
                          </div>
                          <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-full border border-blue-100 hover:bg-blue-50 transition-colors">
                            Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Documents */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Professional Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nurse.documents?.educationalQualification?.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Educational Qualification</p>
                              <p className="text-xs text-gray-500">{doc.name}</p>
                            </div>
                          </div>
                          <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-full border border-blue-100 hover:bg-blue-50 transition-colors">
                            Preview
                          </button>
                        </div>
                      ))}

                      {nurse.documents?.workExperience?.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Work Experience</p>
                              <p className="text-xs text-gray-500">{doc.name}</p>
                            </div>
                          </div>
                          <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-full border border-blue-100 hover:bg-blue-50 transition-colors">
                            Preview
                          </button>
                        </div>
                      ))}

                      {nurse.nocCertificate === 'Yes' && nurse.documents?.nocCertificate && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-700">NOC Certificate</p>
                              <p className="text-xs text-gray-500">{nurse.documents.nocCertificate.name}</p>
                            </div>
                          </div>
                          <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-full border border-blue-100 hover:bg-blue-50 transition-colors">
                            Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional sections */}
            <div className="space-y-4">
              {/* References Section */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">References</h2>
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
                          <span className="font-medium">Name:</span> {nurse.primaryReference.name}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Relation:</span> {nurse.primaryReference.relation}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Phone:</span> {nurse.primaryReference.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Family References
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {nurse.familyReferences.map((ref, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Name:</span> {ref.name}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Relation:</span> {ref.relation}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Phone:</span> {ref.phoneNumber}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Information Section */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">Health Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-700">Current Health Status</h3>
                    </div>
                    <p className="text-sm text-gray-600">{nurse.healthStatus}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-700">Disability Details</h3>
                    </div>
                    <p className="text-sm text-gray-600">{nurse.disabilityDetails}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-sm font-medium text-gray-700">Source of Information</h3>
                    </div>
                    <p className="text-sm text-gray-600">{nurse.sourceOfInformation}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 mb-3">
                  <h2 className="text-base font-semibold text-gray-800">Reviews & Ratings</h2>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-50 px-3 py-1 rounded-full">
                      <span className="text-lg font-semibold text-blue-600">{nurse.rating}</span>
                      <span className="text-sm text-blue-400">/5</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {nurse.reviews?.length || 0} reviews
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {nurse.reviews?.map((review) => (
                    <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">{review.reviewer[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{review.reviewer}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-blue-600">{review.rating}/5</span>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseProfilePage;