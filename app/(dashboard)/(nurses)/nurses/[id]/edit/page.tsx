"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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

type DocumentField = 'aadhar' | 'rationCard' | 'educationalQualification' | 'workExperience' | 'nocCertificate';

type DocumentType = {
  path: string;
  name: string;
};

interface TempFile {
  file: File;
  preview: string;
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
  hiringDate: string;
  experience: number;
  rating: number;
  reviews: Review[];
  preferredLocations: string[];
  languages?: string[];
  profileImage?: {
    url: string;
    name: string;
  };
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
    aadhar?: DocumentType;
    rationCard?: DocumentType;
    educationalQualification?: DocumentType[];
    workExperience?: DocumentType[];
    nocCertificate?: DocumentType;
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

interface FormFieldProps {
  label: string;
  name: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
}

interface FormInputProps extends FormFieldProps {
  type?: string;
}

interface FormSelectProps extends FormFieldProps {
  options: { value: string; label: string; }[];
}

interface FormTextAreaProps extends FormFieldProps {
  rows?: number;
}

interface FormMultiSelectProps extends FormFieldProps {
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  options: { value: string; label: string; }[];
}

const formFieldStyles = {
  input: "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300",
  label: "block text-xs font-medium text-gray-600 transition-colors duration-200",
  error: "text-xs text-red-500 mt-1"
};

// Enhanced Input Component
const FormInput: React.FC<FormInputProps> = ({ label, name, value, onChange, type = "text", error, ...props }) => (
  <div className="space-y-1">
    <label className={formFieldStyles.label}>{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={formFieldStyles.input}
      {...props}
    />
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

// Enhanced Select Component
const FormSelect: React.FC<FormSelectProps> = ({ label, name, value, onChange, options, error }) => (
  <div className="space-y-1">
    <label className={formFieldStyles.label}>{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`${formFieldStyles.input} appearance-none`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

const FormTextArea: React.FC<FormTextAreaProps> = ({ label, name, value, onChange, rows = 3, error }) => (
  <div className="space-y-1">
    <label className={formFieldStyles.label}>{label}</label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={rows}
      className={formFieldStyles.input}
    />
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

const FormMultiSelect: React.FC<FormMultiSelectProps> = ({ 
  label, 
  values, 
  onAdd, 
  onRemove, 
  options, 
  error 
}) => (
  <div className="space-y-2">
    <label className={formFieldStyles.label}>{label}</label>
    <div className="flex flex-wrap gap-2 mb-2">
      {values.map((value) => (
        <span 
          key={value} 
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
        >
          {value}
          <button
            type="button"
            onClick={() => onRemove(value)}
            className="ml-1 text-blue-400 hover:text-blue-600"
          >
            ×
          </button>
        </span>
      ))}
    </div>
    <select
      onChange={(e) => e.target.value && onAdd(e.target.value)}
      value=""
      className={`${formFieldStyles.input} appearance-none`}
    >
      <option value="">Add Location</option>
      {options
        .filter(opt => !values.includes(opt.value))
        .map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
    </select>
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

const getDocumentValue = (
  documents: Nurse['documents'] | undefined,
  type: DocumentField
): DocumentType | DocumentType[] | undefined => {
  if (!documents) return undefined;
  return documents[type];
};

const EditNurseProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [nurse, setNurse] = useState<Nurse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Nurse>>({});
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState<Nurse['documents']>({});
  const [tempFiles, setTempFiles] = useState<Record<string, TempFile[]>>({});

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
            email: "anjali.menon@gmail.com",
            phoneNumber: "9876543210",
            experience: 5,
            rating: 4.5,
            reviews: [
                { id: "r1", text: "Great nurse! Was very attentive and professional during my recovery.", date: "2021-01-01", rating: 5, reviewer: "John Doe" },
                { id: "r2", text: "Very professional and knowledgeable.", date: "2021-06-15", rating: 4, reviewer: "Jane Smith" },
                { id: "r3", text: "Excellent caregiver.", date: "2022-03-22", rating: 5, reviewer: "Raj Kumar" }
            ],
            preferredLocations: ["Kollam", "Palakkad", "Malappuram"],
            languages: ["Malayalam", "English", "Hindi", "Tamil"],
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
            healthStatus: "Good physical and mental health.",
            disabilityDetails: "None",
            sourceOfInformation: "Direct Interview",
            gender: 'Female',
            dob: '1995-06-15',
            salaryPerHour: 350,
            hiringDate: '2020-12-20'
        };
        
        setNurse(mockNurse);
        setFormData(mockNurse);
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const { files } = e.target;
    if (!files?.length) return;

    const newFiles: TempFile[] = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setTempFiles(prev => ({
      ...prev,
      [docType]: [...(prev[docType] || []), ...newFiles]
    }));
  };

  useEffect(() => {
    return () => {
      Object.values(tempFiles).flat().forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [tempFiles]);

  const handleRemoveTempFile = (docType: string, index: number) => {
    setTempFiles(prev => {
      const newFiles = [...(prev[docType] || [])];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return {
        ...prev,
        [docType]: newFiles
      };
    });
  };

  const handleRemoveDocument = (type: DocumentField, index?: number) => {
    setFormData(prev => {
      if (!prev.documents) return prev;
      
      const newDocs = { ...prev.documents };
      
      if (type === 'educationalQualification' || type === 'workExperience') {
        const docs = newDocs[type];
        if (docs && Array.isArray(docs) && typeof index === 'number') {
          const updatedArray = [...docs.slice(0, index), ...docs.slice(index + 1)];
          if (updatedArray.length === 0) {
            delete newDocs[type];
          } else {
            newDocs[type] = updatedArray;
          }
        }
      } else {
        delete newDocs[type];
      }
      
      return { ...prev, documents: newDocs };
    });
  };

  const calculateAge = (dob: string) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleAddLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: [...(prev.preferredLocations || []), location]
    }));
  };

  const handleRemoveLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: (prev.preferredLocations || []).filter(loc => loc !== location)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push(`/nurses/${id}`);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  if (error || !nurse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Error Loading Profile</h1>
          <p className="text-gray-600 mb-4">{error || "Nurse profile not found"}</p>
          <Link href="/nurses" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Return to Nurses List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
                Edit Nurse Profile
              </h1>
              <div className="flex gap-3">
                <Link
                  href={`/nurses/${nurse._id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg 
                    hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                    hover:bg-blue-700 transition-all duration-200 text-sm font-medium
                    disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <section className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-4">
                  <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  <FormInput label="Address" name="address" value={formData.address} onChange={handleInputChange} />
                  <FormInput label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} type="tel" />
                  <FormInput label="Email" name="email" value={formData.email} onChange={handleInputChange} type="email" />
                  <FormSelect 
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Gender" },
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Other", label: "Other" }
                    ]}
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Date of Birth</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob || ""}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm 
                          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                          transition-all duration-200"
                      />
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-[80px] text-center">
                        Age: {formData.dob ? calculateAge(formData.dob) : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormInput label="City" name="city" value={formData.city} onChange={handleInputChange} />
                  <FormInput label="Taluk" name="taluk" value={formData.taluk} onChange={handleInputChange} />
                  <FormInput label="PIN Code" name="pinCode" value={formData.pinCode} onChange={handleInputChange} />
                  <FormInput label="State" name="state" value={formData.state} onChange={handleInputChange} />
                  <FormSelect
                    label="Religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Religion" },
                      { value: "Hindu", label: "Hindu" },
                      { value: "Christian", label: "Christian" },
                      { value: "Muslim", label: "Muslim" }
                    ]}
                  />
                  <FormSelect
                    label="Marital Status"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Marital Status" },
                      { value: "Single", label: "Single" },
                      { value: "Married", label: "Married" },
                      { value: "Widow", label: "Widow" },
                      { value: "Separated", label: "Separated" }
                    ]}
                  />
                </div>

                <div className="space-y-4">
                  <FormMultiSelect
                    label="Preferred Locations"
                    values={formData.preferredLocations || []}
                    onAdd={handleAddLocation}
                    onRemove={handleRemoveLocation}
                    options={[
                      { value: "Kollam", label: "Kollam" },
                      { value: "Palakkad", label: "Palakkad" },
                      { value: "Malappuram", label: "Malappuram" },
                      { value: "Kochi", label: "Kochi" },
                      { value: "Trivandrum", label: "Trivandrum" },
                      { value: "Kozhikode", label: "Kozhikode" },
                      { value: "Thrissur", label: "Thrissur" }
                    ]} name={''} onChange={function (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void {
                      throw new Error('Function not implemented.');
                    } }                  />
                  <FormSelect
                    label="Service Type"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Service Type" },
                      { value: "Home Nurse", label: "Home Nurse" },
                      { value: "Delivery Care", label: "Delivery Care" },
                      { value: "Baby Care", label: "Baby Care" },
                      { value: "HM", label: "HM" }
                    ]}
                  />
                  <FormSelect
                    label="Shifting Pattern"
                    name="shiftingPattern"
                    value={formData.shiftingPattern}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Shift Pattern" },
                      { value: "24 Hour", label: "24 Hour" },
                      { value: "12 Hour", label: "12 Hour" },
                      { value: "8 Hour", label: "8 Hour" },
                      { value: "Hourly", label: "Hourly" }
                    ]}
                  />
                  <FormSelect
                    label="Staff Category"
                    name="staffCategory"
                    value={formData.staffCategory}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Staff Category" },
                      { value: "Permanent", label: "Permanent" },
                      { value: "Trainee", label: "Trainee" },
                      { value: "Temporary", label: "Temporary" }
                    ]}
                  />
                  <FormInput 
                    label="Salary Per Hour" 
                    name="salaryPerHour" 
                    value={formData.salaryPerHour} 
                    onChange={handleInputChange} 
                    type="number"
                  />
                  <div className="space-y-1">
                    <label className={formFieldStyles.label}>Hiring Date</label>
                    <input
                      type="date"
                      name="hiringDate"
                      value={formData.hiringDate || ""}
                      onChange={handleInputChange}
                      className={formFieldStyles.input}
                    />
                  </div>
                  <FormInput 
                    label="Experience (Years)" 
                    name="experience" 
                    value={formData.experience} 
                    onChange={handleInputChange} 
                    type="number"
                  />
                </div>
              </div>
            </section>

            <section className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Profile Image
              </h2>
              <div className="flex items-center gap-4">
                {formData.profileImage?.url && (
                  <img
                    src={formData.profileImage.url}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, "profileImage")}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm 
                      file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0
                      file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100 transition-all duration-200"
                    accept=".jpg,.jpeg,.png"
                  />
                  {formData.profileImage?.name && (
                    <span className="text-xs text-gray-500 block">
                      Current: {formData.profileImage.name}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Documents
              </h2>
              <div className="space-y-5">
                {[{ label: "Aadhar Card", type: "aadhar" as DocumentField }, { label: "Ration Card", type: "rationCard" as DocumentField }].map((doc) => (
                  <div key={doc.type}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{doc.label}</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, doc.type)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm 
                          file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0
                          file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100 transition-all duration-200"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {formData.documents?.[doc.type] && (
                        <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                          <span className="text-xs text-gray-600">
                            Current: {
                              Array.isArray(formData.documents[doc.type]) 
                                ? (formData.documents[doc.type] as DocumentType[])[0]?.name 
                                : (formData.documents[doc.type] as DocumentType)?.name
                            }
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc.type)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {[{ label: "Educational Qualification", type: "educationalQualification" as DocumentField }, { label: "Work Experience", type: "workExperience" as DocumentField }].map((doc) => (
                  <div key={doc.type}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{doc.label}</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e, doc.type)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm 
                          file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0
                          file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100 transition-all duration-200"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {tempFiles[doc.type]?.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs text-blue-700">
                              {file.file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTempFile(doc.type, index)}
                            className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {Array.isArray(formData.documents?.[doc.type]) && (formData.documents?.[doc.type] as DocumentType[]).map((file, index) => (
                        <div key={`existing-${index}`} className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                          <span className="text-xs text-gray-600">
                            {(file as DocumentType).name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc.type, index)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <FormSelect
                    label="NOC Certificate Status"
                    name="nocCertificate"
                    value={formData.nocCertificate}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Status" },
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" },
                      { value: "Applied", label: "Applied" },
                      { value: "Going To Apply", label: "Going To Apply" }
                    ]}
                  />
                  {formData.nocCertificate === "Yes" && (
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Upload NOC Certificate</label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(e, "nocCertificate")}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm 
                            file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0
                            file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100 transition-all duration-200"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        {formData.documents?.nocCertificate && (
                          <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                            <span className="text-xs text-gray-600">
                              Current: {formData.documents.nocCertificate.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument('nocCertificate')}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                References
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Primary Reference</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput label="Name" name="primaryReference.name" value={formData.primaryReference?.name} onChange={handleInputChange} />
                    <FormInput label="Relation" name="primaryReference.relation" value={formData.primaryReference?.relation} onChange={handleInputChange} />
                    <FormInput label="Phone Number" name="primaryReference.phoneNumber" value={formData.primaryReference?.phoneNumber} onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Family References</h3>
                  {[0, 1].map((index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <FormInput 
                        label="Name" 
                        name={`familyReferences[${index}].name`}
                        value={formData.familyReferences?.[index]?.name}
                        onChange={handleInputChange}
                      />
                      <FormInput 
                        label="Relation" 
                        name={`familyReferences[${index}].relation`}
                        value={formData.familyReferences?.[index]?.relation}
                        onChange={handleInputChange}
                      />
                      <FormInput 
                        label="Phone Number" 
                        name={`familyReferences[${index}].phoneNumber`}
                        value={formData.familyReferences?.[index]?.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Health Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormTextArea
                  label="Current Health Status"
                  name="healthStatus"
                  value={formData.healthStatus}
                  onChange={handleInputChange}
                />
                <FormTextArea
                  label="Disability Details"
                  name="disabilityDetails"
                  value={formData.disabilityDetails}
                  onChange={handleInputChange}
                />
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditNurseProfilePage;