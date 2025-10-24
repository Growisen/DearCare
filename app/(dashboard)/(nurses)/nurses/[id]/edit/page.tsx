"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/Loader'
import { fetchNurseDetailsmain, updateNurse } from '@/app/actions/staff-management/add-nurse';
import { SimplifiedNurseDetails, TempFile } from '@/components/nurse/EditNurse/types';

import { ProfileImageSection } from '@/components/nurse/EditNurse/ProfileImageSection';
import { PersonalInformationSection } from '@/components/nurse/EditNurse/PersonalInformationSection';
import { DocumentsSection } from '@/components/nurse/EditNurse/DocumentsSection';
import { ReferencesSection } from '@/components/nurse/EditNurse/ReferencesSection';
import { HealthInformationSection } from '@/components/nurse/EditNurse/HealthInformationSection';

const EditNurseProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id =  Number(params.id); 
 
  const [nurse, setNurse] = useState<SimplifiedNurseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SimplifiedNurseDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [tempFiles, setTempFiles] = useState<Record<string, TempFile[]>>({});

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetchNurseDetailsmain(Number(id));
        if (response.error) throw new Error(response.error);
        setNurse(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  useEffect(() => {
    if (!nurse) return;
    
    setFormData({
      basic: { ...nurse.basic },
      health: nurse.health ? { ...nurse.health } : null,
      references: nurse.references ? { 
        ...nurse.references,
        family_references: nurse.references.family_references ? 
          [...nurse.references.family_references] : [] 
      } : null,
      documents: { ...nurse.documents }
    });
  }, [nurse]);

  useEffect(() => {
    return () => {
      Object.values(tempFiles).flat().forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [tempFiles]);


  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const processValue = () => {
        if (field === 'pin_code' || field === 'experience') return value ? Number(value) : null;
        if (field === 'languages') return value.split(',');
        return value;
      };
      
      const createSection = (sectionName: string) => {
        const defaults: Record<string, unknown> = {
          health: { health_status: null, disability: null, source: null },
          references: { referer_name: null, phone_number: null, relation: null, description: null, family_references: [] }
        };
        return { ...(defaults[sectionName] || {}), [field]: processValue() };
      };
      
      return {
        ...prev,
        [section]: prev[section as keyof typeof prev] 
          ? { ...prev[section as keyof typeof prev], [field]: processValue() } 
          : createSection(section)
      };
    });
  }, [formData]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const { files } = e.target;
    if (!files?.length) return;
    
    const newFiles = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setTempFiles(prev => ({
      ...prev,
      [docType]: [...(prev[docType] || []), ...newFiles]
    }));
    
    e.target.value = '';
  }, []);

  const handleRemoveTempFile = useCallback((docType: string, index: number) => {
    setTempFiles(prev => {
      const updatedFiles = [...(prev[docType] || [])];
      URL.revokeObjectURL(updatedFiles[index].preview);
      updatedFiles.splice(index, 1);
      return { ...prev, [docType]: updatedFiles };
    });
  }, []);

  const handleAddLanguage = useCallback((language: string) => {
    setFormData(prev => prev && ({
      ...prev,
      basic: {
        ...prev.basic,
        languages: [...(prev.basic.languages || []), language]
      }
    }));
  }, []);
  
  const handleRemoveLanguage = useCallback((language: string) => {
    setFormData(prev => prev && ({
      ...prev,
      basic: {
        ...prev.basic,
        languages: (prev.basic.languages || []).filter(lang => lang !== language)
      }
    }));
  }, []);

  const handleFamilyReferenceChange = useCallback((index: number, field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedRefs = [...(prev.references?.family_references || [])];
      
      updatedRefs[index] = {
        ...(updatedRefs[index] || { name: '', relation: '', phone: '' }),
        [field]: value
      };
      
      return {
        ...prev,
        references: {
          ...(prev.references || {
            referer_name: null,
            phone_number: null,
            relation: null,
            description: null,
          }),
          family_references: updatedRefs
        }
      };
    });
  }, []);

  const handleStaffReferenceChange = useCallback((field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        references: {
          ...(prev.references || {
            referer_name: null,
            phone_number: null,
            relation: null,
            description: null,
            family_references: [],
            staff_reference: {},
          }),
          staff_reference: {
            ...(prev.references?.staff_reference || { name: '', relation: '', phone: '', recommendation_details: '' }),
            [field]: value
          }
        }
      };
    });
  }, []);

  const handleRemoveDocument = useCallback((type: string): void => {
    setFormData(prev => prev && ({
      ...prev,
      documents: { ...prev.documents, [type]: undefined }
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);

    try {
      const response = await updateNurse(id, formData, tempFiles);

      if (response?.error) throw new Error(response.error);
      router.push(`/nurses/${id}`);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  }, [formData, tempFiles, id, router]);


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
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-full">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
                Edit Nurse Profile
              </h1>
              <div className="flex gap-3">
                <Link
                  href={`/nurses/${nurse.basic.nurse_id}`}
                  className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-lg transition-all duration-200 text-sm font-medium ${
                    saving ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-gray-200"
                  }`}
                  tabIndex={saving ? -1 : 0}
                  aria-disabled={saving}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-200 text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span>
                      <svg className="inline mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            <ProfileImageSection
              formData={formData}
              tempFiles={tempFiles}
              onFileUpload={handleFileUpload}
              onRemoveDocument={handleRemoveDocument}
              onRemoveTempFile={handleRemoveTempFile}
            />

            <PersonalInformationSection
              formData={formData}
              handleInputChange={handleInputChange}
              onAddLanguage={handleAddLanguage}
              onRemoveLanguage={handleRemoveLanguage}
            />

            <DocumentsSection
              formData={formData}
              tempFiles={tempFiles}
              handleFileUpload={handleFileUpload}
              handleRemoveDocument={handleRemoveDocument}
              handleRemoveTempFile={handleRemoveTempFile}
            />

            <ReferencesSection
              formData={formData}
              handleInputChange={handleInputChange}
              handleFamilyReferenceChange={handleFamilyReferenceChange}
              handleStaffReferenceChange={handleStaffReferenceChange}
            />
            
            <HealthInformationSection
              formData={formData}
              handleInputChange={handleInputChange}
            />

          </div>
        </div>
      </form>
    </div>
  );
};

export default EditNurseProfilePage;