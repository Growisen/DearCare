import React, { useState } from "react";
import DeliveryCareForm from "./DeliveryCareForm";
import { DeliveryCareFormData } from "@/types/deliveryCare.types";

type EditDeliveryCareFormProps = {
  initialData: DeliveryCareFormData;
  onSubmit: (data: DeliveryCareFormData) => void;
};

export default function EditDeliveryCareForm({
  initialData,
  onSubmit,
}: EditDeliveryCareFormProps) {
  const [formData, setFormData] = useState<DeliveryCareFormData>(initialData);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }));
  };

  const handleDutyChange = (key: keyof DeliveryCareFormData["duties"]) => {
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
    if (!formData.carePreferred) errors.carePreferred = "Required";
    if (formData.carePreferred === "post_delivery" && !formData.deliveryDate)
      errors.deliveryDate = "Required";
    if (formData.carePreferred === "pre_delivery" && !formData.expectedDueDate)
      errors.expectedDueDate = "Required";
    // Add more validation as needed
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DeliveryCareForm
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