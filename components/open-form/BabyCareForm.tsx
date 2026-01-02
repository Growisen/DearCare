import React from 'react';
import InputField from '@/components/open-form/InputField';
import { ChildCareFormData } from '@/types/childCare.types';

interface ChildCareFormProps {
  formData: ChildCareFormData;
  setFormData?: React.Dispatch<React.SetStateAction<ChildCareFormData>>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleCheckboxChange: (section: 'careNeeds' | 'homeTasks', key: string) => void;
  formErrors?: Record<string, string>;
}

export default function ChildCareForm({
  formData,
  handleInputChange,
  handleCheckboxChange,
  formErrors
}: ChildCareFormProps) {
  const baseInputStyles = `
    w-full border border-slate-200 bg-white rounded-sm py-2 px-3 text-sm text-gray-800 
    placeholder:text-gray-400
    focus:border-slate-200 focus:outline-none focus:ring-0 
    transition-colors duration-200 appearance-none
  `;
  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
  const sectionHeaderStyles = "text-base font-semibold text-gray-800 mb-6";
  const sectionContainerStyles = "mb-8 border-b border-slate-200 pb-8";
  const checkboxLabelStyles = "flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900 transition-colors";
  const checkboxInputStyles = "h-4 w-4 rounded-sm border-slate-200 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all";

  
	const showCareDetailsInput = formData.careNeeds.specialNeeds || formData.careNeeds.healthIssues;


  return (
    <div className="bg-white">
      <div className={sectionContainerStyles}>
        <h2 className={sectionHeaderStyles}>Child Care Details (0 Months - 10 Years)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
          <div className="md:col-span-4">
            <InputField 
              label="Number of Children"
              type="number"
              id="numberOfChildren"
              value={formData.numberOfChildren}
              onChange={handleInputChange}
              min={1}
              placeholder="e.g. 2"
            />
            {formErrors?.numberOfChildren && (
              <div className="text-xs text-red-500 mt-1">{formErrors.numberOfChildren}</div>
            )}
          </div>
          <div className="md:col-span-8">
            <InputField 
              label="Ages of Children"
              id="agesOfChildren"
              value={formData.agesOfChildren}
              onChange={handleInputChange}
              placeholder="e.g. 2 years, 5 years"
            />
            {formErrors?.agesOfChildren && (
              <div className="text-xs text-red-500 mt-1">{formErrors.agesOfChildren}</div>
            )}
          </div>

          <div className="md:col-span-12">
            <label className={labelStyles}>Key Care Needs</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-1">
              {[
                { key: 'infantCare', label: 'Infant Care' },
                { key: 'youngChildCare', label: 'Young Child' },
                { key: 'schoolAgeSupport', label: 'School-Age' },
                { key: 'specialNeeds', label: 'Special Needs' },
                { key: 'healthIssues', label: 'Health Issues' },
              ].map(({ key, label }) => (
                <label key={key} className={checkboxLabelStyles}>
                  <input
                    type="checkbox"
                    checked={formData.careNeeds[key as keyof typeof formData.careNeeds]}
                    onChange={() => handleCheckboxChange('careNeeds', key)}
                    className={checkboxInputStyles}
                  />
                  {label}
                </label>
              ))}
            </div>
            {formErrors?.careNeeds && (
              <div className="text-xs text-red-500 mt-1">{formErrors.careNeeds}</div>
            )}

            {showCareDetailsInput && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                <input
                  type="text"
                  name="careNeedsDetails"
                  value={formData.careNeedsDetails}
                  onChange={handleInputChange}
                  className={baseInputStyles}
                  placeholder="Please specify details regarding special needs or health issues..."
                />
                {formErrors?.careNeedsDetails && (
                  <div className="text-xs text-red-500 mt-1">{formErrors.careNeedsDetails}</div>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-12">
            <label className={labelStyles}>Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className={baseInputStyles}
              placeholder="Any additional information about the children..."
            />
            {formErrors?.notes && (
              <div className="text-xs text-red-500 mt-1">{formErrors.notes}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className={sectionHeaderStyles}>Housekeeping & Home Support</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6">

          <div className="md:col-span-12">
            <label className={labelStyles}>Primary Focus</label>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="primaryFocus"
                  value="child_care_priority"
                  checked={formData.primaryFocus === 'child_care_priority'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-700 border-slate-200 focus:ring-0"
                />
                <span className="text-sm text-gray-700">Child Care Is Priority</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="primaryFocus"
                  value="both_equal"
                  checked={formData.primaryFocus === 'both_equal'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-700 border-slate-200 focus:ring-0"
                />
                <span className="text-sm text-gray-700">Both Are Equally Important</span>
              </label>
            </div>
            {formErrors?.primaryFocus && (
              <div className="text-xs text-red-500 mt-1">{formErrors.primaryFocus}</div>
            )}
          </div>

          <div className="md:col-span-12 bg-gray-50 p-4 border border-slate-200 rounded-sm">
            <label className={`${labelStyles} mb-3 block`}>Key Home Tasks</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
              {[
                { key: 'laundry', label: "Children's Laundry" },
                { key: 'mealPrep', label: 'Light Meal Prep' },
                { key: 'tidyAreas', label: "Tidy Children's Areas" },
                { key: 'washDishes', label: 'Wash Dishes (Meals)' },
                { key: 'generalTidyUp', label: 'General Tidy Up' },
                { key: 'other', label: 'Other' },
              ].map(({ key, label }) => (
                <label key={key} className={checkboxLabelStyles}>
                  <input
                    type="checkbox"
                    checked={formData.homeTasks[key as keyof typeof formData.homeTasks]}
                    onChange={() => handleCheckboxChange('homeTasks', key)}
                    className={checkboxInputStyles}
                  />
                  {label}
                </label>
              ))}
            </div>
            {formErrors?.homeTasks && (
              <div className="text-xs text-red-500 mt-1">{formErrors.homeTasks}</div>
            )}

            {formData.homeTasks.other && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                <input
                  type="text"
                  name="homeTasksDetails"
                  value={formData.homeTasksDetails}
                  onChange={handleInputChange}
                  className={baseInputStyles}
                  placeholder="Please specify other tasks..."
                />
                {formErrors?.homeTasksDetails && (
                  <div className="text-xs text-red-500 mt-1">{formErrors.homeTasksDetails}</div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}