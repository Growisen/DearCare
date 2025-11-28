import React, { useState } from 'react';
import HousemaidServiceForm from './HomeMaidForm';
import { FormData, Duties } from '@/types/homemaid.types';

type EditHomeMaidFormProps = {
  initialData: FormData;
  onSubmit: (data: FormData) => void;
};

export default function EditHomeMaidForm({ initialData, onSubmit }: EditHomeMaidFormProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleDutyChange = (key: keyof Duties) => {
    setFormData((prev) => ({
      ...prev,
      duties: {
        ...prev.duties,
        [key]: !prev.duties[key],
      },
    }));
  };

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    // Add validation logic as needed
    if (!formData.serviceType) errors.serviceType = 'Required';
    if (formData.serviceType === 'other' && !formData.serviceTypeOther) errors.serviceTypeOther = 'Specify type';
    if (!formData.frequency) errors.frequency = 'Required';
    // ...more validation as needed
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  console.log("EditHomeMaidForm rendered with data:", formData);

  return (
    <form onSubmit={handleSubmit}>
      <HousemaidServiceForm
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleDutyChange={handleDutyChange}
      />
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}