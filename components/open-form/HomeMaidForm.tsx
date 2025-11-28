import React from 'react';
import { Input } from '@/components/ui/input';
import { Duties, FormData } from '@/types/homemaid.types';

interface HousemaidServiceFormProps {
  formData: FormData;
  formErrors: { [key: string]: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleDutyChange: (key: keyof Duties) => void;
}

export default function HousemaidServiceForm({
  formData,
  handleInputChange,
  handleDutyChange,
  formErrors
}: HousemaidServiceFormProps) {
  const baseInputStyles = `
    w-full border border-gray-200 bg-white rounded-sm py-2 px-3 text-sm text-gray-800 
    placeholder:text-gray-400
    focus:border-gray-400 focus:outline-none focus:ring-0 
    transition-colors duration-200 appearance-none
  `;
  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
  const sectionHeaderStyles = "text-base font-semibold text-gray-800 mb-6";
  const sectionContainerStyles = "mb-8 border-b border-gray-100 pb-8";
  const checkboxLabelStyles = "flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900 transition-colors";
  const checkboxInputStyles = "h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all";

  return (
    <div className="bg-white">
      <div className={sectionContainerStyles}>
        <h2 className={sectionHeaderStyles}>Service Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
          <div className="md:col-span-4">
            <label className={labelStyles}>Type of Service</label>
            <div className="flex flex-col gap-2 mt-1">
              {['live-in', 'part-time', 'other'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="serviceType"
                    value={type}
                    checked={formData.serviceType === type}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-700 border-gray-300 focus:ring-0"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {type === 'other' ? 'Other' : type.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
            {formErrors.serviceType && (
              <p className="text-xs text-red-500 mt-1">{formErrors.serviceType}</p>
            )}
            {formData.serviceType === 'other' && (
              <>
                <input
                  type="text"
                  name="serviceTypeOther"
                  value={formData.serviceTypeOther}
                  onChange={handleInputChange}
                  className={`${baseInputStyles} mt-2`}
                  placeholder="Please specify..."
                />
                {formErrors.serviceTypeOther && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.serviceTypeOther}</p>
                )}
              </>
            )}
          </div>

          <div className="md:col-span-4">
            <label className={labelStyles}>Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className={baseInputStyles}
              style={{ backgroundImage: 'none' }}
            >
              <option value="" disabled>Select frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="one-time">One-time Only</option>
            </select>
            {formErrors.frequency && (
              <p className="text-xs text-red-500 mt-1">{formErrors.frequency}</p>
            )}
          </div>

          <div className="md:col-span-4">
            <label className={labelStyles}>Preferred Days & Time</label>
            <Input
              name="preferredSchedule"
              value={formData.preferredSchedule}
              onChange={handleInputChange}
              placeholder="e.g., Mon & Thu, 9am-1pm"
              className={baseInputStyles}
            />
            {formErrors.preferredSchedule && (
              <p className="text-xs text-red-500 mt-1">{formErrors.preferredSchedule}</p>
            )}
          </div>
        </div>
      </div>

      <div className={sectionContainerStyles}>
        <h2 className={sectionHeaderStyles}>Home & Family Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
          <div className="md:col-span-12">
            <label className={labelStyles}>Home Type</label>
            <div className="flex gap-6">
              {['apartment', 'house', 'townhouse'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="homeType"
                    value={type}
                    checked={formData.homeType === type}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-700 border-gray-300 focus:ring-0"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
            {formErrors.homeType && (
              <p className="text-xs text-red-500 mt-1">{formErrors.homeType}</p>
            )}
          </div>

          <div className="md:col-span-4">
            <label className={labelStyles}>Bedrooms</label>
            <Input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              min={0}
              className={baseInputStyles}
            />
            {formErrors.bedrooms && (
              <p className="text-xs text-red-500 mt-1">{formErrors.bedrooms}</p>
            )}
          </div>
          <div className="md:col-span-4">
            <label className={labelStyles}>Bathrooms</label>
            <Input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              min={0}
              className={baseInputStyles}
            />
            {formErrors.bathrooms && (
              <p className="text-xs text-red-500 mt-1">{formErrors.bathrooms}</p>
            )}
          </div>
          <div className="md:col-span-4">
            <label className={labelStyles}>Household Size</label>
            <Input
              type="number"
              name="householdSize"
              value={formData.householdSize}
              onChange={handleInputChange}
              min={1}
              className={baseInputStyles}
            />
            {formErrors.householdSize && (
              <p className="text-xs text-red-500 mt-1">{formErrors.householdSize}</p>
            )}
          </div>

          <div className="md:col-span-12">
            <label className={labelStyles}>Pets in Home?</label>
            <div className="flex gap-6 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasPets"
                  value="yes"
                  checked={formData.hasPets === 'yes'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-700 border-gray-300 focus:ring-0"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasPets"
                  value="no"
                  checked={formData.hasPets === 'no'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-700 border-gray-300 focus:ring-0"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
            {formErrors.hasPets && (
              <p className="text-xs text-red-500 mt-1">{formErrors.hasPets}</p>
            )}
            {formData.hasPets === 'yes' && (
              <>
                <label className={labelStyles}>Pet Details</label>
                <Input
                  name="petDetails"
                  value={formData.petDetails}
                  onChange={handleInputChange}
                  placeholder="Specify type and number"
                  className={baseInputStyles}
                />
                {formErrors.petDetails && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.petDetails}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className={sectionContainerStyles}>
        <h2 className={sectionHeaderStyles}>Key Duties Required</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">Core Cleaning</h3>
            <div className="space-y-2">
              {[
                { key: 'kitchen', label: 'Kitchen Cleaning & Sanitizing' },
                { key: 'bathroom', label: 'Bathroom Cleaning' },
                { key: 'floors', label: 'Floor Cleaning (Vacuum/Mop)' },
                { key: 'dusting', label: 'Dusting & Wiping Surfaces' },
                { key: 'tidying', label: 'General Tidying' },
              ].map(({ key, label }) => (
                <label key={key} className={checkboxLabelStyles}>
                  <input
                    type="checkbox"
                    checked={formData.duties[key as keyof Duties]}
                    onChange={() => handleDutyChange(key as keyof Duties)}
                    className={checkboxInputStyles}
                  />
                  {label}
                </label>
              ))}
              {/* Duty errors */}
              {formErrors.duties && (
                <p className="text-xs text-red-500 mt-1">{formErrors.duties}</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm">
             <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">Assistance</h3>
             <div className="space-y-2">
                <div>
                  <label className={checkboxLabelStyles}>
                    <input
                      type="checkbox"
                      checked={formData.duties.mealPrep}
                      onChange={() => handleDutyChange('mealPrep')}
                      className={checkboxInputStyles}
                    />
                    Meal Preparation
                  </label>
                  {formData.duties.mealPrep && (
                    <div className="mt-2 ml-6">
                      <Input
                        type="text"
                        name="mealPrepDetails"
                        value={formData.mealPrepDetails}
                        onChange={handleInputChange}
                        className={baseInputStyles}
                        placeholder="Veg/Non-veg details..."
                      />
                      {formErrors.mealPrepDetails && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.mealPrepDetails}</p>
                      )}
                    </div>
                  )}
                </div>
                {[
                  { key: 'laundry', label: 'Laundry (Wash/Dry/Fold)' },
                  { key: 'ironing', label: 'Ironing' },
                  { key: 'errands', label: 'Errand Running' },
                ].map(({ key, label }) => (
                  <label key={key} className={checkboxLabelStyles}>
                    <input
                      type="checkbox"
                      checked={formData.duties[key as keyof Duties]}
                      onChange={() => handleDutyChange(key as keyof Duties)}
                      className={checkboxInputStyles}
                    />
                    {label}
                  </label>
                ))}
                <div>
                   <label className={checkboxLabelStyles}>
                    <input
                      type="checkbox"
                      checked={formData.duties.childcare}
                      onChange={() => handleDutyChange('childcare')}
                      className={checkboxInputStyles}
                    />
                    Childcare Assistance
                  </label>
                  {formData.duties.childcare && (
                    <div className="mt-2 ml-6">
                      <Input
                        type="text"
                        name="childcareDetails"
                        value={formData.childcareDetails}
                        onChange={handleInputChange}
                        className={baseInputStyles}
                        placeholder="Specify ages/hours..."
                      />
                      {formErrors.childcareDetails && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.childcareDetails}</p>
                      )}
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className={sectionHeaderStyles}>Special Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
           <div className="md:col-span-12">
             <label className={labelStyles}>Allergies or Sensitivities</label>
             <textarea
                name="allergies"
                rows={2}
                value={formData.allergies}
                onChange={handleInputChange}
                className={baseInputStyles}
                placeholder="e.g., Must use hypoallergenic products"
             />
             {formErrors.allergies && (
               <p className="text-xs text-red-500 mt-1">{formErrors.allergies}</p>
             )}
           </div>

           <div className="md:col-span-12">
              <label className={labelStyles}>Areas to AVOID / DO NOT ENTER</label>
              <Input
                name="restrictedAreas"
                value={formData.restrictedAreas}
                onChange={handleInputChange}
                placeholder="e.g., Home Office, Garage"
                className={baseInputStyles}
              />
              {formErrors.restrictedAreas && (
                <p className="text-xs text-red-500 mt-1">{formErrors.restrictedAreas}</p>
              )}
           </div>

           <div className="md:col-span-12">
              <label className={labelStyles}>Additional Instructions</label>
              <textarea
                name="specialInstructions"
                rows={4}
                value={formData.specialInstructions}
                onChange={handleInputChange}
                className={baseInputStyles}
                placeholder="Any specific protocols..."
              />
              {formErrors.specialInstructions && (
                <p className="text-xs text-red-500 mt-1">{formErrors.specialInstructions}</p>
              )}
           </div>
        </div>
      </div>

    </div>
  );
}