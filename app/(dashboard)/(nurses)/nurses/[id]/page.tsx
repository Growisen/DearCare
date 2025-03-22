"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
}


const NurseProfilePage: React.FC = () => {
  const params = useParams();
  const id = params.id
  const [nurse, setNurse] = useState<Nurse | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          ]
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


// ...existing code...

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
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-600 font-medium text-xl">
                        <div>{nurse.firstName[0]}</div>
                        <div>{nurse.lastName[0]}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-semibold text-gray-800">{nurse.firstName} {nurse.lastName}</h1>
                <p className="text-sm text-gray-600 mt-1">Registered Nurse • {nurse.experience} years experience</p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                    <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <span className="font-medium">{nurse.rating}/5</span>
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                    <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {nurse.location}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                    <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6m0 12V12m0 0l8.5-8.5M12 12l-8.5 8.5"></path></svg>
                    <span className="font-medium">₹{nurse.salaryPerHour}</span>/hr
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
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border border-gray-200">
                  <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">Personal Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-700">{nurse.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone</p>
                      <p className="text-sm text-gray-700">{nurse.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Address</p>
                      <p className="text-sm text-gray-700">123 Medical Avenue, {nurse.location} - 682001</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Gender</p>
                      <p className="text-sm text-gray-700">{nurse.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Age</p>
                      <p className="text-sm text-gray-700">{nurse.dob ? Math.floor((new Date().getTime() - new Date(nurse.dob).getTime()) / 3.15576e+10) : 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-200">
                  <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">Availability</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Languages</p>
                      <p className="text-sm text-gray-700">{nurse.languages ? nurse.languages.join(', ') : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Available Days</p>
                      <p className="text-sm text-gray-700">{nurse.availability?.days.join(', ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Preferred Shifts</p>
                      <p className="text-sm text-gray-700">{nurse.availability?.shifts.join(', ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Preferred Locations</p>
                      <p className="text-sm text-gray-700">{nurse.preferredLocations.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-200">
                  <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">Compensation</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Hourly Rate</p>
                      <p className="text-base font-medium text-gray-700">₹{nurse.salaryPerHour}/hour</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Maximum Rate</p>
                      <p className="text-sm text-gray-700">₹{nurse.salaryCap}/hour</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional sections */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-gray-200">
              <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">Skills & Specializations</h2>
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 text-gray-700">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {nurse.specializations?.map((spec, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded text-gray-700 text-xs border border-gray-200">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {nurse.skills?.map((skill, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border border-gray-200 rounded bg-gray-50">
                      <span className='text-xs font-medium text-gray-700'>{skill.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        skill.proficiency === 'Expert' ? 'bg-gray-100 text-gray-700' :
                        skill.proficiency === 'Advanced' ? 'bg-gray-100 text-gray-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {skill.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-gray-200">
              <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">Education & Certifications</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-700">Education</h3>
                  <div className="space-y-3">
                    {nurse.education?.map((edu, index) => (
                      <div key={index} className="p-3 border-l-2 border-gray-300 bg-gray-50 rounded-r">
                        <p className="text-sm font-medium text-gray-700">{edu.degree}</p>
                        <p className="text-xs text-gray-600 mt-1">{edu.institution} • {edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-700">Certifications</h3>
                  <div className="space-y-3">
                    {nurse.certifications?.map((cert, index) => (
                      <div key={index} className="p-3 border-l-2 border-gray-300 bg-gray-50 rounded-r">
                        <p className="text-sm font-medium text-gray-700">{cert.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{cert.issuedBy} • {cert.year} to {cert.expiryYear}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-gray-200">
              <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">Work Experience</h2>
              <div className="space-y-4">
                {nurse.workHistory?.map((work, index) => (
                  <div key={index} className="border-l-2 border-gray-300 pl-3 py-1">
                    <p className="font-medium text-sm text-gray-700">{work.position}</p>
                    <p className="text-sm text-gray-700">{work.organization}</p>
                    <p className="text-xs text-gray-600 mt-1 mb-2">
                      {new Date(work.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                      {work.endDate ? new Date(work.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present'}
                    </p>
                    <p className="text-xs text-gray-600">{work.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 mb-3">
                <h2 className="text-base font-semibold text-gray-800">Reviews & Ratings</h2>
                <div className="flex items-center">
                  <span className="text-base font-medium text-gray-700">{nurse.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">★</span>
                  <span className="text-gray-500 ml-1 text-xs">({nurse.reviews?.length || 0} reviews)</span>
                </div>
              </div>
              <div className="space-y-4">
                {nurse.reviews?.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-gray-700">{review.reviewer}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex text-gray-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-sm">
                          {i < review.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">{review.text}</p>
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