"use client"
import React from 'react';
import { FormInput, FormTextArea } from './FormPrimitives';
import { SimplifiedNurseDetails } from './types';

type Props = {
  formData: SimplifiedNurseDetails | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

export const HealthInformationSection: React.FC<Props> = ({
  formData, handleInputChange
}) => {
  return (
    <section className="bg-gray-50 rounded-sm p-5">
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
  );
};