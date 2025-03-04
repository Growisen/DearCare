import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, ChevronDown, Check } from 'lucide-react';
import { AddNurseProps, DropdownProps } from '@/types/staff.types';

const locationsInKerala = ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Malappuram"];

const languagesAvailable = ["English", "Malayalam", "Hindi", "Tamil", "Kannada", "Telugu"];
const maritalStatus = ["Single", "Married"];
const religions = ["Hindu", "Christian", "Muslim", "Other"];

const InputField = ({ label, type = 'text', placeholder }: { label: string, type?: string, placeholder: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={label.toLowerCase().replace(/ /g, '-')}>{label}</label>
    <input
      type={type}
      id={label.toLowerCase().replace(/ /g, '-')}
      className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
      placeholder={placeholder}
      aria-label={label}
    />
  </div>
);

const Dropdown = ({ label, options, selectedOptions, toggleOption, isOpen, setIsOpen, dropdownRef }: DropdownProps) => (
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
      <span className="truncate">{selectedOptions.length ? `${selectedOptions.length} locations selected` : 'Select locations...'}</span>
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
);

export function AddNurseOverlay({ onClose, onAdd }: AddNurseProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isLanguagesDropdownOpen, setIsLanguagesDropdownOpen] = useState(false);
  const languagesDropdownRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedImage(e.dataTransfer.files[0]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(selectedLocations.includes(location) ? selectedLocations.filter(loc => loc !== location) : [...selectedLocations, location]);
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(selectedLanguages.includes(language) ? 
      selectedLanguages.filter(lang => lang !== language) : 
      [...selectedLanguages, language]
    );
  };

  const getInputValue = (placeholder: string) => (document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement)?.value;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky z-30 top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Nurse</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200" aria-label="Close">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-8">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="First Name" placeholder="Enter first name" />
              <InputField label="Last Name" placeholder="Enter last name" />
              <InputField label="Phone Number" placeholder="Enter phone number" />
              <InputField label="Email" placeholder="Enter email" />
              <InputField label="Date of Birth" type="date" placeholder="Enter date of birth" />
              <InputField label="Age" type="number" placeholder="Enter age" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="gender">Gender</label>
                <select id="gender" className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200">
                  <option value="">Select gender...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <InputField label="Aadhar Number" placeholder="Enter Aadhar number" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200">
                  <option value="">Select marital status...</option>
                  {maritalStatus.map((status, idx) => (
                    <option key={idx} value={status.toLowerCase()}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Professional Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Years of Experience" type="number" placeholder="Enter years of experience" />
              <InputField label="Academic Qualification" placeholder="Enter academic qualification" />
              <div className="sm:col-span-2">
                <InputField label="Equipment Handled" placeholder="Enter equipment handled (comma separated)" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Knowledge About</label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  rows={3}
                  placeholder="Enter knowledge and expertise..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Language and Location Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                <select className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200">
                  <option value="">Select religion...</option>
                  {religions.map((religion, idx) => (
                    <option key={idx} value={religion.toLowerCase()}>{religion}</option>
                  ))}
                </select>
              </div>
              <InputField label="Mother Tongue" placeholder="Enter mother tongue" />
              <Dropdown
                label="Languages Known"
                options={languagesAvailable}
                selectedOptions={selectedLanguages}
                toggleOption={toggleLanguage}
                isOpen={isLanguagesDropdownOpen}
                setIsOpen={setIsLanguagesDropdownOpen}
                dropdownRef={languagesDropdownRef}
              />
              <Dropdown
                label="Preferred Locations"
                options={locationsInKerala}
                selectedOptions={selectedLocations}
                toggleOption={toggleLocation}
                isOpen={isLocationDropdownOpen}
                setIsOpen={setIsLocationDropdownOpen}
                dropdownRef={locationDropdownRef}
              />
            </div>
          </div>

          {/* Profile Image Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Image</h3>
            <div className={`relative border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg, image/png" onChange={handleImageSelect} aria-label="Profile Image" />
              <div className="space-y-3">
                {selectedImage ? (
                  <div className="flex items-center justify-center space-x-3">
                    <ImageIcon className="h-6 w-6 text-blue-500" />
                    <span className="text-sm text-gray-600">{selectedImage.name}</span>
                    <button type="button" onClick={handleRemoveImage} className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200" aria-label="Remove Image">
                      <X className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <Upload className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Drag and drop your image here, or{' '}
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-500 hover:text-blue-600 font-medium">
                          browse
                        </button>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG (Max 5MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button onClick={onClose} className="px-5 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition duration-200" aria-label="Cancel">
              Cancel
            </button>
            <button
              onClick={() => {
                const nurse = {
                  firstName: getInputValue('Enter first name'),
                  lastName: getInputValue('Enter last name'),
                  email: getInputValue('Enter email'),
                  location: getInputValue('Enter location'),
                  phoneNumber: getInputValue('Enter phone number'),
                  gender: (document.querySelector('select') as HTMLSelectElement)?.value,
                  dob: (document.querySelector('input[type="date"]') as HTMLInputElement)?.value,
                  experience: parseInt(getInputValue('Enter years of experience') || '0', 10),
                  image: selectedImage || undefined,
                  preferredLocations: selectedLocations,
                  age: parseInt(getInputValue('Enter age') || '0', 10),
                  aadharNumber: getInputValue('Enter Aadhar number'),
                  religion: (document.querySelectorAll('select')[1] as HTMLSelectElement)?.value,
                  motherTongue: getInputValue('Enter mother tongue'),
                  languagesKnown: selectedLanguages,
                  maritalStatus: (document.querySelectorAll('select')[2] as HTMLSelectElement)?.value,
                  academicQualification: getInputValue('Enter academic qualification'),
                  equipmentHandled: getInputValue('Enter equipment handled (comma separated)')?.split(',').map(item => item.trim()),
                  knowledgeAbout: (document.querySelector('textarea') as HTMLTextAreaElement)?.value,
                };
                onAdd(nurse);
              }}
              className="flex-1 px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              aria-label="Add Nurse"
            >
              Add Nurse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}