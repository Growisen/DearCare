import React from 'react';
import InputField from '@/components/open-form/InputField';
import { DeliveryCareFormData } from '@/types/deliveryCare.types';

interface DeliveryCareFormProps {
  formData: DeliveryCareFormData;
  formErrors?: { [key: string]: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleDutyChange: (key: keyof DeliveryCareFormData['duties']) => void;
}


const baseInputStyles = `
  w-full border border-slate-200 bg-white rounded-sm py-2 px-3 text-sm text-gray-800 
  placeholder:text-gray-400
  focus:border-slate-200 focus:outline-none focus:ring-0 
  transition-colors duration-200 appearance-none
`;
const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
const sectionHeaderStyles = "text-base font-semibold text-gray-800 mb-6";
const sectionContainerStyles = "mb-8 border-b border-slate-200 pb-8";
const subHeaderStyles = "text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-50 pb-1";
const checkboxLabelStyles = "flex items-start gap-2 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900 transition-colors";
const checkboxInputStyles = "mt-0.5 h-4 w-4 rounded-sm border-slate-200 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all shrink-0";

const DeliveryCareForm: React.FC<DeliveryCareFormProps> = ({
  formData,
  formErrors,
  handleInputChange,
  handleDutyChange
}) => {
  return (
    <div className="bg-white">
      <div className={sectionContainerStyles}>
        <h2 className={sectionHeaderStyles}>Delivery Care Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12">
            <label className={labelStyles}>Care Preferred</label>
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                { id: 'post_delivery', label: 'Post-Delivery Care' },
                { id: 'pre_delivery', label: 'Pre-Delivery Care' },
                { id: 'on_delivery', label: 'On-Delivery Care' }
              ].map((type) => (
                <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    id="carePreferred"
                    name="carePreferred" 
                    value={type.id}
                    checked={formData.carePreferred === type.id}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-gray-700 border-slate-200 focus:ring-0"
                  />
                  <span className={`text-sm ${formData.carePreferred === type.id ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {formData.carePreferred === 'post_delivery' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className={sectionContainerStyles}>
            <h2 className={sectionHeaderStyles}>Mother&apos;s Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
              <div className="md:col-span-6">
                <InputField 
                  label="Delivery Date"
                  type="date"
                  id="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  placeholder="Select delivery date"
                />
                {formErrors?.deliveryDate && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.deliveryDate}</span>
                )}
              </div>
              <div className="md:col-span-6">
                <label className={labelStyles}>Type of Delivery</label>
                <select
                  id="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleInputChange}
                  className={baseInputStyles}
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="">Select Type...</option>
                  <option value="normal">Normal Delivery</option>
                  <option value="c_section">C-Section</option>
                  <option value="other">Other</option>
                </select>
                {formErrors?.deliveryType && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.deliveryType}</span>
                )}
              </div>
              <div className="md:col-span-6">
                <InputField 
                  label="Mother's Allergies / Dietary Restrictions"
                  id="motherAllergies"
                  value={formData.motherAllergies}
                  onChange={handleInputChange}
                  placeholder="e.g. Gluten, Dairy, Specific medicines"
                />
                {formErrors?.motherAllergies && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.motherAllergies}</span>
                )}
              </div>
              <div className="md:col-span-6">
                <InputField 
                  label="Current Medications"
                  id="motherMedications"
                  value={formData.motherMedications}
                  onChange={handleInputChange}
                  placeholder="List current medications if any"
                />
                {formErrors?.motherMedications && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.motherMedications}</span>
                )}
              </div>
            </div>
          </div>

          <div className={sectionContainerStyles}>
            <h2 className={sectionHeaderStyles}>Baby Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
              <div className="md:col-span-4">
                <label className={labelStyles}>Number of Babies</label>
                <select
                  id="numberOfBabies"
                  value={formData.numberOfBabies}
                  onChange={handleInputChange}
                  className={baseInputStyles}
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="single">Single</option>
                  <option value="twins">Twins</option>
                  <option value="triplets">Triplets</option>
                </select>
                {formErrors?.numberOfBabies && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.numberOfBabies}</span>
                )}
              </div>
              <div className="md:col-span-4">
                <label className={labelStyles}>Feeding Method</label>
                <select
                  id="feedingMethod"
                  value={formData.feedingMethod}
                  onChange={handleInputChange}
                  className={baseInputStyles}
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="">Select Method...</option>
                  <option value="breastfeeding">Breastfeeding</option>
                  <option value="formula">Formula</option>
                  <option value="both">Both</option>
                </select>
                {formErrors?.feedingMethod && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.feedingMethod}</span>
                )}
              </div>
              <div className="md:col-span-4">
                <InputField 
                  label="Baby's Allergies/Sensitivities"
                  id="babyAllergies"
                  value={formData.babyAllergies}
                  onChange={handleInputChange}
                  placeholder="Known allergies"
                />
                {formErrors?.babyAllergies && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.babyAllergies}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className={sectionHeaderStyles}>Schedule & Duties</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6">
              
              <div className="md:col-span-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={labelStyles}>Preferred Schedule</label>
                    <select
                      id="preferredSchedule"
                      value={formData.preferredSchedule}
                      onChange={handleInputChange}
                      className={baseInputStyles}
                      style={{ backgroundImage: 'none' }}
                    >
                      <option value="">Select Schedule...</option>
                      <option value="live_in">Live-in</option>
                      <option value="day_shifts">Day Shifts</option>
                      <option value="night_nanny">Night Nanny Only</option>
                    </select>
                    {formErrors?.preferredSchedule && (
                      <span className="text-xs text-red-500 mt-1 block">{formErrors.preferredSchedule}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 bg-gray-50 p-4 border border-slate-200 rounded-sm">
                <h3 className={subHeaderStyles}>Service & Duties</h3>
                <div className="space-y-3">
                  <label className={checkboxLabelStyles}>
                    <input
                      type="checkbox"
                      id="babyCare"
                      checked={formData.duties.babyCare}
                      onChange={() => handleDutyChange('babyCare')}
                      className={checkboxInputStyles}
                    />
                    <div>
                      <span className="font-medium text-gray-800">Baby Care</span>
                      <p className="text-xs text-gray-500 mt-0.5">Bathing, laundry, Diaper changes</p>
                      {formErrors?.['duties.babyCare'] && (
                        <span className="text-xs text-red-500 mt-1 block">{formErrors['duties.babyCare']}</span>
                      )}
                    </div>
                  </label>
                  <label className={checkboxLabelStyles}>
                    <input
                      type="checkbox"
                      id="motherCare"
                      checked={formData.duties.motherCare}
                      onChange={() => handleDutyChange('motherCare')}
                      className={checkboxInputStyles}
                    />
                    <div>
                      <span className="font-medium text-gray-800">Mother&apos;s Care</span>
                      <p className="text-xs text-gray-500 mt-0.5">Post-partum care, Recovery support, Medicine preparation</p>
                      {formErrors?.['duties.motherCare'] && (
                        <span className="text-xs text-red-500 mt-1 block">{formErrors['duties.motherCare']}</span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.carePreferred === 'pre_delivery' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <div className={sectionContainerStyles}>
            <h2 className={sectionHeaderStyles}>Timeline & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
              <div className="md:col-span-4">
                <InputField 
                  label="Expected Due Date (EDD)"
                  type="date"
                  id="expectedDueDate"
                  value={formData.expectedDueDate}
                  onChange={handleInputChange}
                  placeholder="Select expected due date"
                />
                {formErrors?.expectedDueDate && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.expectedDueDate}</span>
                )}
              </div>
              <div className="md:col-span-4">
                <InputField 
                  label="Backup Contact Name"
                  id="backupContactName"
                  value={formData.backupContactName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                />
                {formErrors?.backupContactName && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.backupContactName}</span>
                )}
              </div>
              <div className="md:col-span-4">
                <InputField 
                  label="Backup Contact Number"
                  type="tel"
                  id="backupContactNumber"
                  value={formData.backupContactNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                />
                {formErrors?.backupContactNumber && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.backupContactNumber}</span>
                )}
              </div>
              <div className="md:col-span-12">
                <InputField 
                  label="Planned Place of Birth / Hospital Name"
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  placeholder="Enter hospital name and location"
                />
                {formErrors?.hospitalName && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.hospitalName}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className={sectionHeaderStyles}>Medical Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
              <div className="md:col-span-6">
                <InputField 
                  label="Doctor's Name (Confirmed)"
                  id="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  placeholder="Treating Physician"
                />
                {formErrors?.doctorName && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.doctorName}</span>
                )}
              </div>
              <div className="md:col-span-6">
                <label className={labelStyles}>Allergies / Medical History (Mother)</label>
                <textarea
                  id="medicalHistory"
                  rows={3}
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  className={baseInputStyles}
                  placeholder="Any significant medical history or allergies..."
                />
                {formErrors?.medicalHistory && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.medicalHistory}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.carePreferred === 'on_delivery' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className={sectionContainerStyles}>
            <h2 className={sectionHeaderStyles}>Delivery Event Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
              <div className="md:col-span-6">
                <InputField 
                  label="Actual Date & Time of Birth"
                  type="datetime-local"
                  id="birthDateTime"
                  value={formData.birthDateTime}
                  onChange={handleInputChange}
                  placeholder="Select date and time"
                />
                {formErrors?.birthDateTime && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.birthDateTime}</span>
                )}
              </div>
              <div className="md:col-span-6">
                <label className={labelStyles}>Delivery Type</label>
                <select
                  id="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleInputChange}
                  className={baseInputStyles}
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="">Select Type...</option>
                  <option value="normal">Normal Delivery</option>
                  <option value="c_section">C-Section</option>
                  <option value="other">Other</option>
                </select>
                {formErrors?.deliveryType && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.deliveryType}</span>
                )}
              </div>
            </div>
          </div>

          <div className={sectionContainerStyles}>
            <h2 className={sectionHeaderStyles}>Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
              <div className="md:col-span-8">
                <InputField 
                  label="Hospital Name"
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  placeholder="Name of the hospital"
                />
                {formErrors?.hospitalName && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.hospitalName}</span>
                )}
              </div>
              <div className="md:col-span-4">
                <InputField 
                  label="Room / Ward Details"
                  id="roomDetails"
                  value={formData.roomDetails}
                  onChange={handleInputChange}
                  placeholder="Room No, Ward Name"
                />
                {formErrors?.roomDetails && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.roomDetails}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className={sectionHeaderStyles}>Baby Vitals</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
              <div className="md:col-span-6">
                <label className={labelStyles}>Gender</label>
                <select
                  id="babyGender"
                  value={formData.babyGender}
                  onChange={handleInputChange}
                  className={baseInputStyles}
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="">Select Gender...</option>
                  <option value="male">Boy</option>
                  <option value="female">Girl</option>
                </select>
                {formErrors?.babyGender && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.babyGender}</span>
                )}
              </div>
              <div className="md:col-span-6">
                <InputField 
                  label="Weight"
                  id="babyWeight"
                  value={formData.babyWeight}
                  onChange={handleInputChange}
                  placeholder="e.g. 3.2 kg"
                />
                {formErrors?.babyWeight && (
                  <span className="text-xs text-red-500 mt-1 block">{formErrors.babyWeight}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DeliveryCareForm;