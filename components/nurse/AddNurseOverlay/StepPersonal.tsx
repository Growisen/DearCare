import React from 'react';
import { NurseFormData } from '@/types/staff.types';
import { Fields, FormLayout, FormField } from './FormComponents';
import { FORM_CONFIG } from './Config';
import { formatDateToDDMMYYYY, formatDateToISO } from '@/utils/dateUtils';

interface StepPersonalProps {
  formData: NurseFormData;
  setFormData: React.Dispatch<React.SetStateAction<NurseFormData>>;
}

export const StepPersonal: React.FC<StepPersonalProps> = ({ formData, setFormData }) => {
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

  const admittedTypeLabelMap: Record<string, string> = {
    Tata_Homenursing: 'Tata Home Nursing',
    Dearcare_Llp: 'Dearcare LLP'
  };

  return (
    <FormLayout>
      <Fields.Input label="First Name" placeholder="Enter first name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
      <Fields.Input label="Last Name" placeholder="Enter last name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
      <FormField label="Admitted Type">
        <input
          className={FORM_CONFIG.styles.input}
          value={admittedTypeLabelMap[formData.admitted_type] || ''}
          disabled
          readOnly
        />
      </FormField>
      <Fields.Input
        label="Previous Register Number"
        placeholder="Enter previous register number (if applicaple)"
        value={formData.nurse_prev_reg_no}
        onChange={(e) => setFormData({ ...formData, nurse_prev_reg_no: e.target.value })}
        required={false}
      />
      <FormField label="Joining Date">
        <input
          type="date"
          className={FORM_CONFIG.styles.input}
          value={formatDateToISO(formData.joining_date)}
          onChange={e => setFormData({ ...formData, joining_date: formatDateToDDMMYYYY(e.target.value) })}
          required
          max={new Date().toISOString().split('T')[0]}
        />
      </FormField>
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
};