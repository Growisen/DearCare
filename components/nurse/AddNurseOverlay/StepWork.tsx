import React from 'react';
import { NurseFormData } from '@/types/staff.types';
import { Fields, FormLayout } from './FormComponents';
import { FORM_CONFIG } from './Config';

interface StepWorkProps {
  formData: NurseFormData;
  setFormData: React.Dispatch<React.SetStateAction<NurseFormData>>;
}

export const StepWork: React.FC<StepWorkProps> = ({ formData, setFormData }) => (
  <FormLayout>
    <Fields.Select label="Type of Service" options={FORM_CONFIG.options.serviceTypes} value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })} />
    <Fields.Select label="Shifting Pattern" options={FORM_CONFIG.options.shiftingPatterns} value={formData.shift_pattern} onChange={(e) => setFormData({ ...formData, shift_pattern: e.target.value })} />
    <Fields.Select label="Category of Staff" options={FORM_CONFIG.options.staffCategories} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
    <Fields.Input label="Medical Field Experience" placeholder="Enter years of experience" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
    <Fields.Input
      label="Salary Per Month"
      type="number"
      placeholder="Enter salary per month"
      value={formData.salary_per_month}
      onChange={(e) => setFormData({ ...formData, salary_per_month: e.target.value })}
      required={false}
      min={0}
    />
  </FormLayout>
);