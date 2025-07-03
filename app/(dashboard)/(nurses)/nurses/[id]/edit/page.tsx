"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/Loader'
import Image from 'next/image';
import { fetchNurseDetailsmain, SimplifiedNurseDetails, updateNurse } from '@/app/actions/staff-management/add-nurse';
//import { update } from '@/app/actions/update-nurse'; // Adjust the import path as needed

// Optimized interfaces
interface TempFile { file: File; preview: string; }
interface DocumentDisplay { fieldName: string; label: string; currentValue?: string; allowMultiple?: boolean; }
interface FormFieldProps {
  label: string; name: string; value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
}

// Form styling constants
const formFieldStyles = {
  input: "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300",
  label: "block text-xs font-medium text-gray-600 transition-colors duration-200",
  error: "text-xs text-red-500 mt-1"
};

// Form components - simplified with default props and destructured params
const FormInput = ({ label, name, value = "", onChange, type = "text", error, ...props }: 
  FormFieldProps & { type?: string }) => (
  <div className="space-y-1">
    <label className={formFieldStyles.label}>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} className={formFieldStyles.input} {...props} />
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

const FormSelect = ({ label, name, value = "", onChange, options, error }: 
  FormFieldProps & { options: { value: string; label: string; }[] }) => (
  <div className="space-y-1">
    <label className={formFieldStyles.label}>{label}</label>
    <select name={name} value={value} onChange={onChange} className={`${formFieldStyles.input} appearance-none`}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

const FormTextArea = ({ label, name, value = "", onChange, rows = 3, error }: 
  FormFieldProps & { rows?: number }) => (
  <div className="space-y-1">
    <label className={formFieldStyles.label}>{label}</label>
    <textarea name={name} value={value} onChange={onChange} rows={rows} className={formFieldStyles.input} />
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

const FormMultiSelect = ({ label, values = [], onAdd, onRemove, options, error }: 
  Omit<FormFieldProps, 'value'> & { values: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void; 
  options: { value: string; label: string; }[] }) => (
  <div className="space-y-2">
    <label className={formFieldStyles.label}>{label}</label>
    <div className="flex flex-wrap gap-2 mb-2">
      {values.map(value => (
        <span key={value} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {value}
          <button type="button" onClick={() => onRemove(value)} className="ml-1 text-blue-400 hover:text-blue-600">×</button>
        </span>
      ))}
    </div>
    <select onChange={e => e.target.value && onAdd(e.target.value)} value="" 
      className={`${formFieldStyles.input} appearance-none`}>
      <option value="">Add Location</option>
      {options.filter(opt => !values.includes(opt.value))
        .map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

// Icons for document types and file types - moved to separate component to reduce repeated SVG code
const IconCollection = {
  documentIcons: {
    adhar: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>,
    ration: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    educational: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    experience: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    noc: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    profile_image: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    default: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  },
  fileIcons: {
    pdf: <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    image: <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    default: <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  upload: <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
  profile: <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  remove: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

// Helper components - Simplified with more direct implementation
const DocumentIcon = React.memo(({ type }: { type: string }) => {
  const icon = IconCollection.documentIcons[type as keyof typeof IconCollection.documentIcons] 
    || IconCollection.documentIcons.default;
  const colorClass = {
    adhar: 'bg-purple-100 text-purple-600',
    ration: 'bg-yellow-100 text-yellow-600',
    educational: 'bg-blue-100 text-blue-600',
    experience: 'bg-green-100 text-green-600',
    noc: 'bg-red-100 text-red-600',
    profile_image: 'bg-indigo-100 text-indigo-600'
  }[type] || 'bg-gray-100 text-gray-600';

  return (
    <span className={`flex items-center justify-center w-8 h-8 rounded-full ${colorClass}`}>
      {icon}
    </span>
  );
});
DocumentIcon.displayName = 'DocumentIcon';

const FileTypeIcon = React.memo(({ fileName }: { fileName: string }) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return IconCollection.fileIcons.pdf;
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return IconCollection.fileIcons.image;
  return IconCollection.fileIcons.default;
});
FileTypeIcon.displayName = 'FileTypeIcon';

// Optimized DocumentUploader component with cleaner rendering logic
const DocumentUploader = React.memo(({ 
  document, onFileUpload, onRemove, tempFiles = [], onRemoveTempFile 
}: {
  document: DocumentDisplay;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void;
  onRemove: (type: string) => void;
  tempFiles?: TempFile[];
  onRemoveTempFile?: (index: number) => void;
}) => {
  // File item renderer - reused for both current and temp files
  const renderFileItem = (fileName: string, onClickRemove: () => void, key?: string | number) => (
    <div key={key} className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-center space-x-2 overflow-hidden">
        <FileTypeIcon fileName={fileName} />
        <span className="text-xs text-blue-700 truncate max-w-[180px]">
          {fileName.split('/').pop()}
        </span>
      </div>
      <button
        type="button"
        onClick={onClickRemove}
        className="ml-2 p-1 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Remove file"
      >
        {IconCollection.remove}
      </button>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-center gap-2 mb-3">
        <DocumentIcon type={document.fieldName} />
        <h4 className="font-medium text-gray-700">{document.label}</h4>
      </div>
      
      {/* Upload input */}
      <div className="relative mb-3">
        <label 
          htmlFor={`file-${document.fieldName}`} 
          className="flex items-center justify-center w-full p-3 bg-gray-50 border border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center">
            {IconCollection.upload}
            <span className="text-xs font-medium text-gray-600">
              {document.allowMultiple ? 'Click to upload multiple files' : 'Click to upload file'}
            </span>
            <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG</span>
          </div>
        </label>
        <input
          id={`file-${document.fieldName}`}
          type="file"
          onChange={(e) => onFileUpload(e, document.fieldName)}
          multiple={document.allowMultiple}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>
      
      {/* Files display */}
      <div className="space-y-2">
        {document.currentValue && renderFileItem(
          document.currentValue, 
          () => onRemove(document.fieldName)
        )}
        
        {tempFiles.map((file, index) => renderFileItem(
          file.file.name, 
          () => onRemoveTempFile && onRemoveTempFile(index), 
          index
        ))}
        
        {!document.currentValue && tempFiles.length === 0 && (
          <div className="p-2 text-center text-xs text-gray-500">
            No {document.label.toLowerCase()} uploaded yet
          </div>
        )}
      </div>
    </div>
  );
});
DocumentUploader.displayName = 'DocumentUploader';

// Main component
const EditNurseProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id =  Number(params.id); 
  
  // State declarations
  const [nurse, setNurse] = useState<SimplifiedNurseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SimplifiedNurseDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [tempFiles, setTempFiles] = useState<Record<string, TempFile[]>>({});

  // Memoized profile image renderer
  const renderProfileImage = useMemo(() => {
    if (!formData) return null;
    
    // Show temp file preview if available
    if (tempFiles["profile_image"]?.length > 0) {
      return (
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <Image
            src={tempFiles["profile_image"][0].preview}
            alt="New Profile"
            fill
            className="object-cover"
            sizes="128px"
            priority
          />
          <button 
            onClick={() => handleRemoveTempFile('profile_image', 0)}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-md text-red-500 hover:text-red-600"
            title="Remove new profile image"
            type="button"
          >
            {IconCollection.remove}
          </button>
        </div>
      );
    } 
    
    // Show existing profile image
    if (formData.documents.profile_image) {
      return (
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <Image
            src={formData.documents.profile_image}
            alt="Profile"
            fill
            className="object-cover"
            sizes="128px"
            priority
          />
          <button 
            onClick={() => handleRemoveDocument('profile_image')}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-md text-red-500 hover:text-red-600"
            title="Remove profile image"
            type="button"
          >
            {IconCollection.remove}
          </button>
        </div>
      );
    }
    
    // Show empty profile placeholder
    return (
      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
        {IconCollection.profile}
      </div>
    );
  }, [formData, tempFiles]);

  // Data fetching effect
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

  // Set form data when nurse data loads
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

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      Object.values(tempFiles).flat().forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [tempFiles]);

  // Handler functions - optimized with destructuring and more concise logic
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    setFormData(prev => {
      if (!prev) return prev;
      
      // Helper to handle field type conversions
      const processValue = () => {
        if (field === 'pin_code' || field === 'experience') return value ? Number(value) : null;
        if (field === 'languages') return value.split(',');
        return value;
      };
      
      // Create section if it doesn't exist
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
    
    e.target.value = ''; // Reset input
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
      
      // Create or update reference
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

  const handleRemoveDocument = useCallback((type: string): void => {
    setFormData(prev => prev && ({
      ...prev,
      documents: { ...prev.documents, [type]: undefined }
    }));
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);

    try {
      // Call your update function instead of fetch
      // Adjust arguments as per your update function's signature
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

  // Loading and error states
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

  // Main form render
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
                Edit Nurse Profile
              </h1>
              <div className="flex gap-3">
                <Link
                  href={`/nurses/${nurse.basic.nurse_id}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Form content - reordered sections */}
          <div className="p-6 space-y-6">
            {/* 1. Profile Image Section */}
            <section className="bg-gray-50 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Profile Image
              </h2>
              <div className="flex items-start flex-col md:flex-row gap-6">
                {renderProfileImage}
                
                <div className="flex-1 w-full">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Profile Image</h4>
                    <p className="text-xs text-gray-500 mb-3">Please upload a clear photo. Profile image should be JPG or PNG format.</p>
                    <label 
                      htmlFor="profile-image-upload" 
                      className="flex items-center justify-center w-full p-4 bg-gray-50 border border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center">
                        {IconCollection.upload}
                        <span className="text-sm font-medium text-gray-600">Click to upload image</span>
                      </div>
                    </label>
                    <input
                      id="profile-image-upload"
                      type="file"
                      onChange={(e) => handleFileUpload(e, "profile_image")}
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Personal Information Section */}
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
                    label="Previous Register Number" 
                    name="basic.nurse_prev_reg_no" 
                    value={formData?.basic.nurse_prev_reg_no || ''} 
                    onChange={handleInputChange} 
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

            {/* 3. Documents Section */}
            <section className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
                <div className="text-xs text-gray-500">All documents must be in PDF, JPG, or PNG format</div>
              </div>
              
              {/* Document sections */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-700">Identity Documents</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocumentUploader 
                      document={{
                        fieldName: 'adhar',
                        label: 'Aadhar Card',
                        currentValue: formData?.documents.adhar || undefined
                      }}
                      onFileUpload={handleFileUpload}
                      onRemove={handleRemoveDocument}
                      tempFiles={tempFiles['adhar']}
                      onRemoveTempFile={(index) => handleRemoveTempFile('adhar', index)}
                    />
                    
                    <DocumentUploader 
                      document={{
                        fieldName: 'ration',
                        label: 'Ration Card',
                        currentValue: formData?.documents.ration || undefined
                      }}
                      onFileUpload={handleFileUpload}
                      onRemove={handleRemoveDocument}
                      tempFiles={tempFiles['ration']}
                      onRemoveTempFile={(index) => handleRemoveTempFile('ration', index)}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-700">Professional Documents</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocumentUploader 
                      document={{
                        fieldName: 'educational',
                        label: 'Educational Qualifications',
                        currentValue: formData?.documents.educational || undefined,
                        allowMultiple: true
                      }}
                      onFileUpload={handleFileUpload}
                      onRemove={handleRemoveDocument}
                      tempFiles={tempFiles['educational']}
                      onRemoveTempFile={(index) => handleRemoveTempFile('educational', index)}
                    />
                    
                    <DocumentUploader 
                      document={{
                        fieldName: 'experience',
                        label: 'Work Experience',
                        currentValue: formData?.documents.experience || undefined,
                        allowMultiple: true
                      }}
                      onFileUpload={handleFileUpload}
                      onRemove={handleRemoveDocument}
                      tempFiles={tempFiles['experience']}
                      onRemoveTempFile={(index) => handleRemoveTempFile('experience', index)}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-700">Certificates</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <DocumentUploader 
                      document={{
                        fieldName: 'noc',
                        label: 'NOC Certificate',
                        currentValue: formData?.documents.noc || undefined
                      }}
                      onFileUpload={handleFileUpload}
                      onRemove={handleRemoveDocument}
                      tempFiles={tempFiles['noc']}
                      onRemoveTempFile={(index) => handleRemoveTempFile('noc', index)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 4. References Section */}
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
                        name={`family_reference_${index}_name`}
                        value={formData?.references?.family_references?.[index]?.name || ''}
                        onChange={(e) => handleFamilyReferenceChange(index, 'name', e.target.value)}
                      />
                      <FormInput 
                        label="Relation" 
                        name={`family_reference_${index}_relation`}
                        value={formData?.references?.family_references?.[index]?.relation || ''}
                        onChange={(e) => handleFamilyReferenceChange(index, 'relation', e.target.value)}
                      />
                      <FormInput 
                        label="Phone" 
                        name={`family_reference_${index}_phone`}
                        value={formData?.references?.family_references?.[index]?.phone || ''}
                        onChange={(e) => handleFamilyReferenceChange(index, 'phone', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Health Information Section */}
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditNurseProfilePage;