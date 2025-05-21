"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/Loader'
import Image from 'next/image';
import { fetchNurseDetailsmain, SimplifiedNurseDetails } from '@/app/actions/add-nurse';






// interface Education {
//   degree: string;
//   institution: string;
//   year: string;
// }

// interface Certification {
//   name: string;
//   issuedBy: string;
//   year: string;
//   expiryYear: string;
// }

// interface WorkHistory {
//   organization: string;
//   position: string;
//   startDate: string;
//   endDate?: string;
//   description: string;
// }

// interface Availability {
//   days: string[];
//   shifts: string[];
// }

// interface Skill {
//   name: string;
//   proficiency: 'Expert' | 'Advanced' | 'Intermediate';
// }


type DocumentField = 'aadhar' | 'rationCard' | 'educationalQualification' | 'workExperience' | 'nocCertificate';



interface TempFile {
  file: File;
  preview: string;
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

// const getDocumentValue = (
//   documents: Nurse['documents'] | undefined,
//   type: DocumentField
// ): DocumentType | DocumentType[] | undefined => {
//   if (!documents) return undefined;
//   return documents[type];
// };

const EditNurseProfilePage: React.FC = () => {
  const params = useParams();
  
  const router = useRouter();
  const id = params.id;
   const [nurse, setNurse] = useState<SimplifiedNurseDetails | null>(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SimplifiedNurseDetails | null>(null);

  const [saving, setSaving] = useState(false);
  // const [documents, setDocuments] = useState<Nurse['documents']>({});
  const [tempFiles, setTempFiles] = useState<Record<string, TempFile[]>>({});

  useEffect(() => {
    console.log('Nurse ID:', id);

    async function loadData() {
          if (!params.id) return
    
          setLoading(true)
          try {
            // Fetch nurse details and assignments in parallel
            const [nurseResponse] = await Promise.all([
              fetchNurseDetailsmain(Number(params.id)),
            ])
            
            if (nurseResponse.error) {
              setError(nurseResponse.error)
              return
            }
    
            
    
            setNurse(nurseResponse.data)
            
            
    
            console.log('Nurse:', nurseResponse.data)
            
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data')
          } finally {
            setLoading(false)
          }
        }
    
        loadData()
 
    
    
  }, [id]);
  useEffect(() => {
    if (nurse) {
      setFormData({
        basic: {
          nurse_id: nurse.basic.nurse_id,
          first_name: nurse.basic.first_name,
          last_name: nurse.basic.last_name,
          email: nurse.basic.email,
          phone_number: nurse.basic.phone_number,
          gender: nurse.basic.gender,
          date_of_birth: nurse.basic.date_of_birth,
          address: nurse.basic.address,
          city: nurse.basic.city,
          state: nurse.basic.state,
          pin_code: nurse.basic.pin_code,
          languages: nurse.basic.languages,
          experience: nurse.basic.experience,
          service_type: nurse.basic.service_type,
          shift_pattern: nurse.basic.shift_pattern,
          category: nurse.basic.category,
          status: nurse.basic.status,
          marital_status: nurse.basic.marital_status,
          religion: nurse.basic.religion,
          mother_tongue: nurse.basic.mother_tongue
        },
        health: nurse.health ? {
          health_status: nurse.health.health_status,
          disability: nurse.health.disability,
          source: nurse.health.source
        } : null,
        references: nurse.references ? {
          referer_name: nurse.references.referer_name,
          phone_number: nurse.references.phone_number,
          relation: nurse.references.relation,
          description: nurse.references.description,
          family_references: nurse.references.family_references
        } : null,
        documents: {
          profile_image: nurse.documents.profile_image,
          adhar: nurse.documents.adhar,
          educational: nurse.documents.educational,
          experience: nurse.documents.experience,
          noc: nurse.documents.noc,
          ration: nurse.documents.ration
        }
      });
    }
  }, [nurse]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
  
    const { name, value } = e.target;
    const [section, field] = name.split('.');
  
    setFormData(prev => {
      if (!prev) return prev;
  
      switch (section) {
        case 'basic':
          return {
            ...prev,
            basic: {
              ...prev.basic,
              [field]: field === 'pin_code' || field === 'experience'
                ? value ? Number(value) : null
                : field === 'languages'
                  ? value.split(',')
                  : value
            }
          };
  
        case 'health':
          return {
            ...prev,
            health: prev.health ? {
              ...prev.health,
              [field]: value
            } : {
              health_status: null,
              disability: null,
              source: null,
              [field]: value
            }
          };
  
        case 'references':
          return {
            ...prev,
            references: prev.references ? {
              ...prev.references,
              [field]: value
            } : {
              referer_name: null,
              phone_number: null,
              relation: null,
              description: null,
              family_references: null,
              [field]: value
            }
          };
  
        default:
          return prev;
      }
    });
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

  const handleAddLanguage = (language: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        basic: {
          ...prev.basic,
          languages: [...(prev.basic.languages || []), language]
        }
      };
    });
  };
  
  const handleRemoveLanguage = (language: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        basic: {
          ...prev.basic,
          languages: (prev.basic.languages || []).filter(lang => lang !== language)
        }
      };
    });
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
                  href={`/nurses/${nurse.basic.nurse_id}`}
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
            {/* Personal Information Section */}
            <section className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-4">
                  <FormInput 
                    label="First Name" 
                    name="basic.first_name" 
                    value={formData?.basic.first_name || ''} 
                    onChange={handleInputChange} 
                  />
                  <FormInput 
                    label="Last Name" 
                    name="basic.last_name" 
                    value={formData?.basic.last_name || ''} 
                    onChange={handleInputChange} 
                  />
                  <FormInput 
                    label="Email" 
                    name="basic.email" 
                    value={formData?.basic.email || ''} 
                    onChange={handleInputChange} 
                    type="email" 
                  />
                  <FormInput 
                    label="Phone Number" 
                    name="basic.phone_number" 
                    value={formData?.basic.phone_number || ''} 
                    onChange={handleInputChange} 
                  />
                  <FormSelect 
                    label="Gender"
                    name="basic.gender"
                    value={formData?.basic.gender || ''}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Gender" },
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" }
                    ]}
                  />
                  <FormInput 
                    label="Date of Birth" 
                    name="basic.date_of_birth" 
                    value={formData?.basic.date_of_birth || ''} 
                    onChange={handleInputChange} 
                    type="date"
                  />
                </div>

                <div className="space-y-4">
                  <FormInput 
                    label="Address" 
                    name="basic.address" 
                    value={formData?.basic.address || ''} 
                    onChange={handleInputChange} 
                  />
                  <FormInput 
                    label="City" 
                    name="basic.city" 
                    value={formData?.basic.city || ''} 
                    onChange={handleInputChange} 
                  />
                  <FormInput 
                    label="State" 
                    name="basic.state" 
                    value={formData?.basic.state || ''} 
                    onChange={handleInputChange} 
                  />
                  <FormInput 
                    label="PIN Code" 
                    name="basic.pin_code" 
                    value={formData?.basic.pin_code?.toString() || ''} 
                    onChange={handleInputChange} 
                    type="number"
                  />
                  <FormSelect
                    label="Religion"
                    name="basic.religion"
                    value={formData?.basic.religion || ''}
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
                    name="basic.marital_status"
                    value={formData?.basic.marital_status || ''}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Marital Status" },
                      { value: "Single", label: "Single" },
                      { value: "Married", label: "Married" }
                    ]}
                  />
                </div>

                <div className="space-y-4">
                  <FormInput 
                    label="Mother Tongue" 
                    name="basic.mother_tongue" 
                    value={formData?.basic.mother_tongue || ''} 
                    onChange={handleInputChange} 
                  />
                  <FormSelect
                    label="Service Type"
                    name="basic.service_type"
                    value={formData?.basic.service_type || ''}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Service Type" },
                      { value: "Home Nurse", label: "Home Nurse" },
                      { value: "Delivery Care", label: "Delivery Care" },
                      { value: "Baby Care", label: "Baby Care" }
                    ]}
                  />
                  <FormSelect
                    label="Shift Pattern"
                    name="basic.shift_pattern"
                    value={formData?.basic.shift_pattern || ''}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Shift Pattern" },
                      { value: "24 Hour", label: "24 Hour" },
                      { value: "12 Hour", label: "12 Hour" },
                      { value: "8 Hour", label: "8 Hour" }
                    ]}
                  />
                  <FormSelect
                    label="Category"
                    name="basic.category"
                    value={formData?.basic.category || ''}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select Category" },
                      { value: "Permanent", label: "Permanent" },
                      { value: "Temporary", label: "Temporary" }
                    ]}
                  />
                  <FormInput 
                    label="Experience (Years)" 
                    name="basic.experience" 
                    value={formData?.basic.experience?.toString() || ''} 
                    onChange={handleInputChange} 
                    type="number"
                  />
                  <FormMultiSelect
                    label="Languages"
                    name="basic.languages"
                    values={formData?.basic.languages || []}
                    onAdd={handleAddLanguage}
                    onRemove={handleRemoveLanguage}
                    options={[
                      { value: "Malayalam", label: "Malayalam" },
                      { value: "English", label: "English" },
                      { value: "Hindi", label: "Hindi" },
                      { value: "Tamil", label: "Tamil" }
                    ]}
                    onChange={() => {}}
                  />
                </div>
              </div>
            </section>

            {/* Health Information Section */}
            <section className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Health Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormTextArea
                  label="Health Status"
                  name="health.health_status"
                  value={formData?.health?.health_status || ''}
                  onChange={handleInputChange}
                />
                <FormTextArea
                  label="Disability"
                  name="health.disability"
                  value={formData?.health?.disability || ''}
                  onChange={handleInputChange}
                />
                <FormInput
                  label="Source"
                  name="health.source"
                  value={formData?.health?.source || ''}
                  onChange={handleInputChange}
                />
              </div>
            </section>

            {/* References Section */}
<section className="bg-gray-50 rounded-lg p-5">
  <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
    References
  </h2>
  <div className="space-y-6">
    {/* Primary Reference */}
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Primary Reference</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput 
          label="Name" 
          name="references.referer_name" 
          value={formData?.references?.referer_name || ''} 
          onChange={handleInputChange} 
        />
        <FormInput 
          label="Relation" 
          name="references.relation" 
          value={formData?.references?.relation || ''} 
          onChange={handleInputChange} 
        />
        <FormInput 
          label="Phone Number" 
          name="references.phone_number" 
          value={formData?.references?.phone_number || ''} 
          onChange={handleInputChange} 
        />
      </div>
      <div className="mt-4">
        <FormTextArea 
          label="Description" 
          name="references.description" 
          value={formData?.references?.description || ''} 
          onChange={handleInputChange} 
        />
      </div>
    </div>

    {/* Family References */}
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Family References</h3>
      {[0, 1].map((index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormInput 
            label="Name" 
            name={`references.family_references.${index}.name`}
            value={formData?.references?.family_references?.[index]?.name || ''}
            onChange={handleInputChange}
          />
          <FormInput 
            label="Relation" 
            name={`references.family_references.${index}.relation`}
            value={formData?.references?.family_references?.[index]?.relation || ''}
            onChange={handleInputChange}
          />
          <FormInput 
            label="Phone" 
            name={`references.family_references.${index}.phone`}
            value={formData?.references?.family_references?.[index]?.phone || ''}
            onChange={handleInputChange}
          />
        </div>
      ))}
    </div>
  </div>
</section>

            <section className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Profile Image
              </h2>
              <div className="flex items-center gap-4">
              {formData?.documents.profile_image && (
            <div className="relative w-16 h-16">
    <Image
      src={formData.documents.profile_image}
      alt="Profile"
      fill
      className="rounded-full border border-gray-200 object-cover"
      sizes="64px"
      priority
    />
  </div>
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
                  {formData?.documents.profile_image && (
                    <span className="text-xs text-gray-500 block">
                      Current: {formData.documents.profile_image}
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
                      {/* {formData.documents?.[doc.type] && (
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
                      )} */}
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
                      {/* {Array.isArray(formData.documents?.[doc.type]) && (formData.documents?.[doc.type] as DocumentType[]).map((file, index) => (
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
                      ))} */}
                    </div>
                  </div>
                ))}
                {/* <div>
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
                </div> */}
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
                  value={formData?.health?.health_status||""}
                  onChange={handleInputChange}
                />
                <FormTextArea
                  label="Disability Details"
                  name="disabilityDetails"
                  value={formData?.health?.disability||""}
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