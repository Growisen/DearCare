import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { AddNurseProps, DropdownProps, NurseFormData, NurseReferenceData, NurseHealthData,NurseDocuments, BaseNurseFields,stp1BaseNurseFields } from '@/types/staff.types';
import { createNurse } from '@/app/actions/add-nurse';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
const FORM_CONFIG = {
  options: {
    locationsInKerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Malappuram"] as string[],
    languagesAvailable: ["English", "Malayalam", "Hindi", "Tamil", "Kannada", "Telugu"] as string[],
    maritalStatus: ["Single", "Married", "Widow", "Separated"] as string[],
    religions: ["Hindu", "Christian", "Muslim", "Other"] as string[],
    serviceTypes: ["Home Nurse", "Delivery Care", "Baby Care", "HM"," Ayurveda"," Panchakarma Therapist"] as string[],
    shiftingPatterns: ["24 Hour", "12 Hour", "8 Hour", "Hourly"] as string[],
    staffCategories: ["Permanent", "Trainee", "Temporary"] as string[],
    nocOptions: ["Yes", "No", "Applied", "Going To Apply"] as string[],
    admittedTypes: ['Tata_Homenursing', 'Dearcare_Llp'] as string[],
    sourceOfInformation: [
      "Leads From Facebook",
      "Leads From Ivr",
      "Leads From WhatsApp",
      "Phone Landline",
      "Justdial",
      "Newspaper",
      "Client Reference",
      "Sulekha",
      "Direct Entry",
      "Lead From Csv"
    ] as string[]
  },
  steps: ["Personal Details", "Contact Information", "References", "Work Details", "Health & Additional Info", "Document Upload"],
  styles: {
    input: "w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200",
    label: "block text-sm font-medium text-gray-700 mb-1",
    button: "px-4 py-2 text-sm rounded-lg transition-colors duration-200",
    layout: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }
} as const;

// Utility components
const FormField = ({ label,required = true, children }: { label: string, required?: boolean, children: React.ReactNode }) => (
  <div>
    <label className={FORM_CONFIG.styles.label}>{label}{required && ' *'}</label>
    {children}
  </div>
);

const FormLayout = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`${FORM_CONFIG.styles.layout} ${className}`}>{children}</div>
);

// Form field components consolidated into a single object
const Fields = {
  Input: ({ label, required = true, ...props }: { 
    label: string, 
    required?: boolean 
  } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <FormField label={label} required={required}>
      <input 
        {...props} 
        required={required}
        className={FORM_CONFIG.styles.input} 
      />
    </FormField>
  ),

  Select: ({ label, options, value, onChange, required = true }: { label: string, options: string[], value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void ,required?: boolean }) => (
    <FormField label={label}  required={required}>
      <select className={FORM_CONFIG.styles.input} value={value} onChange={onChange} required={required}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </FormField>
  ),

  TextArea: ({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <FormField label={label}>
      <textarea {...props} className={FORM_CONFIG.styles.input} rows={3} />
    </FormField>
  ),

  Dropdown: ({ label, options, selectedOptions, toggleOption, isOpen, setIsOpen, dropdownRef }: DropdownProps) => (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        <span className="text-gray-400 text-xs ml-1">({selectedOptions.length} selected)</span>
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 flex items-center justify-between"
      >
        <span className="truncate">{selectedOptions.length ? `${selectedOptions.length} selected` : 'Select options...'}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 space-y-1">
            {options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => toggleOption(option)}
                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md flex items-center justify-between group transition-colors duration-200"
              >
                <span>{option}</span>
                {selectedOptions.includes(option) && <Check className="h-4 w-4 text-blue-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedOptions.map((option: string, idx: number) => (
          <div key={idx} className="flex items-center bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm group hover:bg-blue-100 transition-colors duration-200">
            {option}
            <button type="button" onClick={() => toggleOption(option)} className="ml-2 text-blue-400 hover:text-blue-600 group-hover:text-blue-700" aria-label={`Remove ${option}`}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  ),

  File: ({ label, docType, onFileSelect, required = true }: {
    label: string,
    docType: string,
    onFileSelect: (file: File) => void,
    required?: boolean
  }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Map docType to accepted file extensions
    const getAcceptedFileTypes = (type: string) => {
      const typeMap: Record<string, string> = {
        'ration': '.pdf,.jpg,.jpeg,.png',
        'aadhar': '.pdf,.jpg,.jpeg,.png',
        'pan': '.pdf,.jpg,.jpeg,.png',
        'passport': '.pdf,.jpg,.jpeg,.png',
        // Add more document types as needed
        'default': '.pdf,.jpg,.jpeg,.png'
      };
      
      return typeMap[type] || typeMap.default;
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        onFileSelect(file);
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => setPreview(e.target?.result as string);
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
      }
    };

    return (
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {docType && <span className="text-xs text-gray-500">({docType})</span>}
      </label>
      <div className="mt-1 space-y-2">
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept={getAcceptedFileTypes(docType)}
            required={required}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Choose File
          </button>
          <span className="ml-3 text-sm text-gray-500">
            {fileInputRef.current?.files?.[0]?.name || "No file chosen"}
          </span>
        </div>
        {preview && (
  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
    <Image
      src={preview}
      alt="File preview"
      fill
      className="object-cover"
      sizes="128px"
    />
  </div>
)}
      </div>
    </div>
    );
  }
};

// Step content components
const StepContent = {
  Personal: ({ formData, setFormData }: { formData: NurseFormData, setFormData: React.Dispatch<React.SetStateAction<NurseFormData>> }) => {
    const calculateAge = (dob: string) => {
      if (!dob) return;
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setFormData(prev => ({ ...prev, age: calculatedAge }));
    };

    return (
      <FormLayout>
        <Fields.Input label="First Name" placeholder="Enter first name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
        <Fields.Input label="Last Name" placeholder="Enter last name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
        <Fields.Select 
          label="Admitted Type" 
          options={FORM_CONFIG.options.admittedTypes} 
          value={formData.admitted_type} 
          onChange={(e) => setFormData({ ...formData, admitted_type: e.target.value as 'Tata_Homenursing' | 'Dearcare_Llp' })} 
        />
        <Fields.Input 
          label="Previous Register Number" 
          placeholder="Enter previous register number (if applicaple)" 
          value={formData.nurse_prev_reg_no} 
          onChange={(e) => setFormData({ ...formData, nurse_prev_reg_no: e.target.value })}
          required={false}
        />
        <Fields.Select label="Gender" options={["Male", "Female"]} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} />
        <Fields.Select label="Marital Status" options={FORM_CONFIG.options.maritalStatus} value={formData.marital_status} onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })} />
        <Fields.Input 
          label="Date of Birth" 
          type="date" 
          placeholder="" 
          value={formData.date_of_birth}
          max={new Date().toISOString().split('T')[0]} 
          onChange={(e) => {
            setFormData({ ...formData, date_of_birth: e.target.value });
            calculateAge(e.target.value);
          }}
        />
        <Fields.Input 
          label="Age" 
          type="number" 
          value={formData.age} 
          disabled 
          placeholder="Auto-calculated"
        />
        <Fields.Select label="Religion" options={FORM_CONFIG.options.religions} value={formData.religion} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} />
        <Fields.Input label="Mother Tongue" placeholder="Enter mother tongue" value={formData.mother_tongue} onChange={(e) => setFormData({ ...formData, mother_tongue: e.target.value })} />
      </FormLayout>
    );
  },

  Contact: ({ formData, setFormData }: { formData: NurseFormData, setFormData: React.Dispatch<React.SetStateAction<NurseFormData>> }) => {
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(formData.languages);
    const [isLanguagesDropdownOpen, setIsLanguagesDropdownOpen] = useState(false);
    const languagesDropdownRef = useRef<HTMLDivElement>(null);

    const toggleLanguage = (language: string) => {
      const newLanguages = selectedLanguages.includes(language) 
        ? selectedLanguages.filter((lang) => lang !== language)
        : [...selectedLanguages, language];
      setSelectedLanguages(newLanguages);
      setFormData({ ...formData, languages: newLanguages });
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (languagesDropdownRef.current && !languagesDropdownRef.current.contains(event.target as Node)) {
          setIsLanguagesDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <FormLayout>
        <div className="sm:col-span-2">
          <Fields.Input label="Address" placeholder="Enter full address" value={formData.address}  required={false} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
        </div>
        <Fields.Input label="City"  placeholder="Enter city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required={false}/>
        <Fields.Input label="Taluk"  required={false} placeholder="Enter taluk" value={formData.taluk} onChange={(e) => setFormData({ ...formData, taluk: e.target.value })} />
        <Fields.Input label="State"  required={false} placeholder="Enter state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
        <Fields.Input label="PIN Code"  required={false} placeholder="Enter PIN code" value={formData.pin_code} onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })} />
        <Fields.Input label="Phone Number" placeholder="Enter phone number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
        <Fields.Input 
        label="Email" 
        type="email" 
        placeholder="Enter email address" 
        value={formData.email} 
        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
      />
        <Fields.Dropdown 
          label="Known Languages"
          options={FORM_CONFIG.options.languagesAvailable}
          selectedOptions={selectedLanguages}
          toggleOption={toggleLanguage}
          isOpen={isLanguagesDropdownOpen}
          setIsOpen={setIsLanguagesDropdownOpen}
          dropdownRef={languagesDropdownRef as React.RefObject<HTMLDivElement>}
        />
      </FormLayout>
    );
  },

  Document: ({ setDocuments, nurseData, setNurseData }: { 
    setDocuments: React.Dispatch<React.SetStateAction<NurseDocuments>>,
    nurseData: NurseFormData, 
    setNurseData: React.Dispatch<React.SetStateAction<NurseFormData>> 
  }) => {
    const [nocStatus, setNocStatus] = useState<string>(nurseData.noc_status);

    return (
      <div className="space-y-6">
        <Fields.File 
          label="Profile Image" 
          docType="profile_image" 
          onFileSelect={(file) => setDocuments(prev => ({ ...prev, profile_image: file }))}
          required={false}
        />
        <Fields.File 
          label="Aadhar Card" 
          docType="adhar" 
          onFileSelect={(file) => setDocuments(prev => ({ ...prev, adhar: file }))}
          required={false}
        />
        <Fields.File 
          label="Educational Certificates" 
          docType="educational"
          onFileSelect={(file) => setDocuments(prev => ({ ...prev, educational: file }))}
          required={false}
        />
        <Fields.File 
          label="Experience Certificates" 
          docType="experience"
          onFileSelect={(file) => setDocuments(prev => ({ ...prev, experience: file }))}
          required={false}
        />
        <Fields.File 
          label="Ration Card" 
          docType="ration"
          onFileSelect={(file) => setDocuments(prev => ({ ...prev, ration: file }))}
          required={false}
        />
        <div className="space-y-4">
          <FormField label="NOC Certificate Status">
            <select 
              className={FORM_CONFIG.styles.input}
              value={nocStatus}
              onChange={(e) => {
                setNocStatus(e.target.value);
                setNurseData({ ...nurseData, noc_status: e.target.value });
              }}
            >
              <option value="">Select NOC status</option>
              {FORM_CONFIG.options.nocOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </FormField>
          
          {nocStatus === 'Yes' && (
          <Fields.File 
            label="NOC Certificate" 
            docType="noc"
            onFileSelect={(file) => setDocuments(prev => ({ ...prev, noc: file }))}
            required={false}
          />
        )}
        </div>
      </div>
    )
  },

  Reference: ({ data, setData }: { data: NurseReferenceData, setData: React.Dispatch<React.SetStateAction<NurseReferenceData>> }) => (
    <div className="space-y-8">
      {/* Primary Reference */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h4 className="text-base font-medium">Primary Reference</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <Fields.Input label="Full Name" placeholder="Enter name" value={data.reference_name} required={false} onChange={(e) => setData({ ...data, reference_name: e.target.value })} />
          <Fields.Input label="Relation" placeholder="Enter relation" value={data.reference_relation} required={false} onChange={(e) => setData({ ...data, reference_relation: e.target.value })} />
          <Fields.Input label="Phone Number" type="tel" placeholder="Enter phone number" value={data.reference_phone} required={false} onChange={(e) => setData({ ...data, reference_phone: e.target.value })} />
        </div>
        
        <Fields.TextArea 
          label="Recommendation Details"
          placeholder="Please provide details about why they recommend this nurse..."
          rows={3}
          required={false}
          value={data.recommendation_details}
          onChange={(e) => setData({ ...data, recommendation_details: e.target.value })}
        />
      </div>

      {/* Family References */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h4 className="text-base font-medium">Family References</h4>
        </div>

        {[0, 1].map(index => (
          <div key={index} className="space-y-2">
            <p className="text-sm text-gray-500">Reference {index + 1}</p>
            <div className="grid grid-cols-3 gap-4">
              <Fields.Input 
                label="Full Name"
                required={false} 
                placeholder="Enter name" 
                value={data.family_references[index]?.name || ''}
                onChange={(e) => {
                  const newRefs = [...data.family_references];
                  newRefs[index] = { ...newRefs[index] || {}, name: e.target.value };
                  setData({ ...data, family_references: newRefs });
                }}
              />
              <Fields.Input 
                label="Relation" 
                placeholder="Enter relation"
                value={data.family_references[index]?.relation || ''}
                required={false}
                onChange={(e) => {
                  const newRefs = [...data.family_references];
                  newRefs[index] = { ...newRefs[index] || {}, relation: e.target.value };
                  setData({ ...data, family_references: newRefs });
                }}
              />
              <Fields.Input 
                label="Phone Number" 
                type="tel" 
                placeholder="Enter phone number"
                value={data.family_references[index]?.phone || ''}
                required={false}
                onChange={(e) => {
                  const newRefs = [...data.family_references];
                  newRefs[index] = { ...newRefs[index] || {}, phone: e.target.value };
                  setData({ ...data, family_references: newRefs });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  Work: ({ formData, setFormData }: { formData: NurseFormData, setFormData: React.Dispatch<React.SetStateAction<NurseFormData>> }) => (
    <FormLayout>
      <Fields.Select label="Type of Service" options={FORM_CONFIG.options.serviceTypes} value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })} />
      <Fields.Select label="Shifting Pattern" options={FORM_CONFIG.options.shiftingPatterns} value={formData.shift_pattern} onChange={(e) => setFormData({ ...formData, shift_pattern: e.target.value })} />
      <Fields.Select label="Category of Staff" options={FORM_CONFIG.options.staffCategories} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
      <Fields.Input label="Medical Field Experience" placeholder="Enter years of experience" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
    </FormLayout>
  ),

  Health: ({ data, setData }: { data: NurseHealthData, setData: React.Dispatch<React.SetStateAction<NurseHealthData>> }) => (
    <FormLayout>
      <Fields.TextArea label="Current Health Status" required={false} placeholder="Enter current health status" value={data.health_status} onChange={(e) => setData({ ...data, health_status: e.target.value })} />
      <Fields.TextArea label="Disability Details" required={false} placeholder="Enter disability details if any" value={data.disability} onChange={(e) => setData({ ...data, disability: e.target.value })} />
      <Fields.Select label="Source of Information" required={true} options={FORM_CONFIG.options.sourceOfInformation} value={data.source} onChange={(e) => setData({ ...data, source: e.target.value })} />
    </FormLayout>
  )
};

type StepData = NurseFormData|stp1BaseNurseFields |BaseNurseFields| NurseReferenceData | NurseHealthData | (NurseDocuments & { noc_status?: string });
const validateStep = (step: number, data: StepData): boolean => {
  switch (step) {
    case 0: // Personal Details
      return !!(
       (data as NurseFormData).first_name &&
        (data as NurseFormData).last_name &&
        (data as NurseFormData).gender &&
        (data as NurseFormData).date_of_birth &&
        (data as NurseFormData).marital_status &&
        (data as NurseFormData).religion &&
        (data as NurseFormData).mother_tongue
      );
    
    case 1: // Contact Information
      return !!(
        
        (data as NurseFormData).phone_number &&
        (data as NurseFormData).email &&
        (data as NurseFormData).languages.length > 0
      );
    
    case 2: // References
      return true;
    
    case 3: // Work Details
      return !!(
        (data as NurseFormData).service_type &&
        (data as NurseFormData).shift_pattern &&
        (data as NurseFormData).category &&
        (data as NurseFormData).experience
      );
    
    case 4: // Health & Additional Info
      return !!(
        
        (data as NurseHealthData).source
      );
    
    case 5: // Document Upload
    return !!(
      
      // If NOC status is Yes, require the NOC file
      ((data as NurseFormData).noc_status !== 'Yes' || (data as NurseDocuments).noc)
    );
    
    default:
      return false;
  }
};


export function AddNurseOverlay({ onClose }: AddNurseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  // const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [documents, setDocuments] =  useState<NurseDocuments>({
    adhar: null,
    educational: null,
    experience: null,
    profile_image: null,
    noc: null,
    ration: null
  });

  const [nurseData, setNurseData] = useState<NurseFormData>({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    address: '',
    city: '',
    taluk: '',
    state: '',
    pin_code: '',
    phone_number: '',
    email:'',
    languages: [],
    noc_status: '', 
    service_type: '',
    shift_pattern: '',
    category: '',
    experience: '',
    marital_status: '',
    religion: '',
    mother_tongue: '',
    age: '',
    nurse_reg_no: '',
    admitted_type: 'Tata_Homenursing',
    nurse_prev_reg_no: ''
  });
  
  const [referenceData, setReferenceData] = useState<NurseReferenceData>({
    reference_name: '',
    reference_phone: '',
    reference_relation: '',
    reference_address: '',
    recommendation_details: '',
    family_references: [{
      name: '',
      relation: '',
      phone: ''
    }, {
      name: '',
      relation: '',
      phone: ''
    }] 
  });
  
  const [healthData, setHealthData] = useState<NurseHealthData>({
    health_status: '',
    disability: '',
    source: ''
  });

  // const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setSelectedImage(e.target.files[0]);
  //   }
  // };

  

  const renderStep = () => {
    const steps = {
      0: <StepContent.Personal formData={nurseData} setFormData={setNurseData} />,
      1: <StepContent.Contact formData={nurseData} setFormData={setNurseData} />,
      2: <StepContent.Reference data={referenceData} setData={setReferenceData} />,
      3: <StepContent.Work formData={nurseData} setFormData={setNurseData} />,
      4: <StepContent.Health data={healthData} setData={setHealthData} />,
      5: <StepContent.Document setDocuments={setDocuments} nurseData={nurseData} setNurseData={setNurseData} />
    };
    return steps[currentStep as keyof typeof steps] || null;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return validateStep(0, nurseData);
      case 1:
        return validateStep(1, nurseData);
      case 2:
        return validateStep(2, referenceData);
      case 3:
        return validateStep(3, nurseData);
      case 4:
        return validateStep(4, healthData);
        case 5:
          return validateStep(5, {
            ...documents,
            noc_status: nurseData.noc_status
          });
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fill in all required fields before proceeding');
    }
  };


  const handleSubmit = async () => {
    if (!canProceed()) {
      toast.error('Please fill in all required fields before submitting');
      return;
    }
  
    try {
      const result = await createNurse(
        nurseData,
        referenceData,
        healthData,
        documents
      );
if (!result.success) {
        toast.error(result.error || 'Failed to add nurse');
        return;
      }
  
      if (result.success) {
        toast.success('Nurse added successfully!');
        onClose();
      } else {
        toast.error(result.error || 'Failed to add nurse');
      }
    } catch (error) {
      console.error('Error submitting nurse data:', error);
      toast.error('An error occurred while adding the nurse');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Nurse</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="shrink-0 px-6 pt-4">
          <div className="flex justify-between mb-4">
            {FORM_CONFIG.steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-gray-700 ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  {index + 1}
                </div>
                <span className="hidden sm:block text-xs mt-1 text-gray-700">{step}</span>
                {/* Show current step name on mobile, but only for the active step */}
                {currentStep === index && (
                  <span className="sm:hidden text-xs mt-1 font-medium text-blue-600">{step}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 text-gray-700">
          {renderStep()}
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t px-6 py-4 bg-white mt-auto flex justify-between items-center rounded-b-2xl">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm bg-gray-100 rounded-lg text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-blue-600 font-medium">Step {currentStep + 1} of {FORM_CONFIG.steps.length}</span>
          <button
            onClick={() => currentStep === FORM_CONFIG.steps.length - 1 ? handleSubmit() : handleNext()}
            disabled={!canProceed()}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:text-white rounded-lg disabled:opacity-50 disabled:text-gray-100"
          >
            {currentStep === FORM_CONFIG.steps.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
  

}