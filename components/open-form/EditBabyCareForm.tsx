import React, { useState } from 'react';
import ChildCareForm from './BabyCareForm';
import { ChildCareFormData } from '@/types/childCare.types';

type EditBabyCareFormProps = {
  initialData: ChildCareFormData;
  onSubmit: (data: ChildCareFormData) => void;
};

export default function EditBabyCareForm({ initialData, onSubmit }: EditBabyCareFormProps) {
  const safeInitialData = {
    ...initialData,
    careNeeds: initialData.careNeeds ?? {},
    homeTasks: initialData.homeTasks ?? {},
  };

  const [formData, setFormData] = useState<ChildCareFormData>(safeInitialData);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (
    section: 'careNeeds' | 'homeTasks',
    key: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !(prev[section] as Record<string, boolean>)[key],
      },
    }));
  };

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.numberOfChildren) errors.numberOfChildren = 'Required';
    if (!formData.agesOfChildren) errors.agesOfChildren = 'Required';
    if (!formData.primaryFocus) errors.primaryFocus = 'Required';
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  console.log("EditBabyCareForm - formData:", formData);    

  return (
    <form onSubmit={handleSubmit}>
      <ChildCareForm
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleCheckboxChange={handleCheckboxChange}
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