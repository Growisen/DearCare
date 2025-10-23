import React, { useState, useRef, useEffect } from 'react';
import { NurseFormData } from '@/types/staff.types';
import { Fields, FormLayout } from './FormComponents';
import { FORM_CONFIG } from './Config';

interface StepContactProps {
  formData: NurseFormData;
  setFormData: React.Dispatch<React.SetStateAction<NurseFormData>>;
}

export const StepContact: React.FC<StepContactProps> = ({ formData, setFormData }) => {
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
        <Fields.Input label="Address" placeholder="Enter full address" value={formData.address} required={false} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
      </div>
      <Fields.Input label="City" placeholder="Enter city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required={false} />
      <Fields.Input label="Taluk" required={false} placeholder="Enter taluk" value={formData.taluk} onChange={(e) => setFormData({ ...formData, taluk: e.target.value })} />
      <Fields.Input label="State" required={false} placeholder="Enter state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
      <Fields.Input label="PIN Code" required={false} placeholder="Enter PIN code" value={formData.pin_code} onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })} />
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
};