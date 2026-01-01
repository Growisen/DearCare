"use client"
import React from 'react';
import { FormInput, FormTextArea } from './FormPrimitives';
import { SimplifiedNurseDetails } from './types';

type Props = {
  formData: SimplifiedNurseDetails | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFamilyReferenceChange: (index: number, field: string, value: string) => void;
  handleStaffReferenceChange: (field: string, value: string) => void;
};

export const ReferencesSection: React.FC<Props> = ({
  formData, handleInputChange, handleFamilyReferenceChange, handleStaffReferenceChange
}) => {
  return (
    <section className="bg-gray-50 rounded-sm p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-slate-200 pb-2">
        References
      </h2>
      <div className="space-y-6">
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

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Staff Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput 
              label="Name"
              name="staff_reference_name"
              value={formData?.references?.staff_reference?.name || ''}
              onChange={e => handleStaffReferenceChange('name', e.target.value)}
            />
            <FormInput 
              label="Relation"
              name="staff_reference_relation"
              value={formData?.references?.staff_reference?.relation || ''}
              onChange={e => handleStaffReferenceChange('relation', e.target.value)}
            />
            <FormInput 
              label="Phone"
              name="staff_reference_phone"
              value={formData?.references?.staff_reference?.phone || ''}
              onChange={e => handleStaffReferenceChange('phone', e.target.value)}
            />
          </div>
          <div className="mt-4">
            <FormTextArea 
              label="Description"
              name="staff_reference_description"
              value={formData?.references?.staff_reference?.recommendation_details || ''}
              onChange={e => handleStaffReferenceChange('recommendation_details', e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};