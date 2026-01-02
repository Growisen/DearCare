"use client"
import React from 'react';
import { FormInput, FormSelect, FormMultiSelect } from './FormPrimitives';
import { SimplifiedNurseDetails } from './types';

type Props = {
  formData: SimplifiedNurseDetails | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onAddLanguage: (lang: string) => void;
  onRemoveLanguage: (lang: string) => void;
};

export const PersonalInformationSection: React.FC<Props> = ({
  formData, handleInputChange, onAddLanguage, onRemoveLanguage
}) => {
  return (
    <section className="bg-gray-50 rounded-sm p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-slate-200 pb-2">
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
            label="Joining Date"
            name="basic.joining_date"
            value={formData?.basic.joining_date || ''}
            onChange={handleInputChange}
            type="date"
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
          <FormInput 
            label="Salary Per Month" 
            name="basic.salary_per_month" 
            value={formData?.basic.salary_per_month || ''} 
            onChange={handleInputChange} 
            type="number"
          />
          <FormMultiSelect
            label="Languages"
            name="basic.languages"
            values={formData?.basic.languages || []}
            onAdd={onAddLanguage}
            onRemove={onRemoveLanguage}
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
  );
};