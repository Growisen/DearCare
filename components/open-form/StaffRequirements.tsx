import React from 'react';
import { StaffRequirement } from '@/types/client.types';
import { Trash2, Plus } from 'lucide-react';

interface StaffRequirementsProps {
  clientType: 'organization' | 'hospital' | 'carehome';
  formData: {
    staffRequirements: StaffRequirement[];
    staffReqStartDate: string;
  };
  onChange: (staffRequirements: StaffRequirement[], startDate?: string) => void;
}

export const StaffRequirements = ({ clientType, formData, onChange }: StaffRequirementsProps) => {

  const staffTypeOptions = {
    hospital: [
      { value: "msc_nursing", label: "MSC NURSING" },
      { value: "bsc_nursing", label: "BSC NURSING" },
      { value: "gnm", label: "GNM" },
      { value: "anm", label: "ANM" },
      { value: "gda", label: "GDA" },
      { value: "ahnpc", label: "AHNPC" },
      { value: "delivery_care", label: "DELIVERY CARE" },
      { value: "baby_care", label: "BABY CARE" },
      { value: "ayurveda_nursing", label: "AYURVEDA NURSING" },
      { value: "panchakarma", label: "PANCHAKARMA THERAPY" },
      { value: "experienced_nurses", label: "EXPERIENCED NURSES" },
      { value: "fresher", label: "FRESHER" },
      { value: "trainee", label: "TRAINEE" },
      { value: "physiotherapy", label: "PHYSIOTHERAPY" },
      { value: "home_nurse", label: "HOME NURSE" },
      { value: "hospital_bystander", label: "HOSPITAL BYSTANDER" },
      { value: "cert_homecare", label: "CERTIFICATE IN HOMECARE NURSING" },
      { value: "diploma_homecare", label: "DIPLOMA IN HOMECARE NURSING" },
      { value: "hha", label: "HOME HEALTH AIDE (HHA) COURSE" },
      { value: "chbhc", label: "CERTIFICATE IN HOME BASED HEALTH CARE (CHBHC)" },
      { value: "caregiver", label: "CAREGIVER TRAINING PROGRAMS" },
      { value: "family_caregiver", label: "FAMILY CAREGIVER TRAINING" },
      { value: "geriatric_care", label: "GERIATRIC CARE ASSISTANT" }
    ],
    carehome: [
      { value: "msc_nursing", label: "MSC NURSING" },
      { value: "bsc_nursing", label: "BSC NURSING" },
      { value: "gnm", label: "GNM" },
      { value: "anm", label: "ANM" },
      { value: "gda", label: "GDA" },
      { value: "ahnpc", label: "AHNPC" },
      { value: "delivery_care", label: "DELIVERY CARE" },
      { value: "baby_care", label: "BABY CARE" },
      { value: "ayurveda_nursing", label: "AYURVEDA NURSING" },
      { value: "panchakarma", label: "PANCHAKARMA THERAPY" },
      { value: "experienced_nurses", label: "EXPERIENCED NURSES" },
      { value: "fresher", label: "FRESHER" },
      { value: "trainee", label: "TRAINEE" },
      { value: "physiotherapy", label: "PHYSIOTHERAPY" },
      { value: "home_nurse", label: "HOME NURSE" },
      { value: "hospital_bystander", label: "HOSPITAL BYSTANDER" },
      { value: "cert_homecare", label: "CERTIFICATE IN HOMECARE NURSING" },
      { value: "diploma_homecare", label: "DIPLOMA IN HOMECARE NURSING" },
      { value: "hha", label: "HOME HEALTH AIDE (HHA) COURSE" },
      { value: "chbhc", label: "CERTIFICATE IN HOME BASED HEALTH CARE (CHBHC)" },
      { value: "caregiver", label: "CAREGIVER TRAINING PROGRAMS" },
      { value: "family_caregiver", label: "FAMILY CAREGIVER TRAINING" },
      { value: "geriatric_care", label: "GERIATRIC CARE ASSISTANT" }
    ],
    organization: [
      { value: "msc_nursing", label: "MSC NURSING" },
      { value: "bsc_nursing", label: "BSC NURSING" },
      { value: "gnm", label: "GNM" },
      { value: "anm", label: "ANM" },
      { value: "gda", label: "GDA" },
      { value: "ahnpc", label: "AHNPC" },
      { value: "delivery_care", label: "DELIVERY CARE" },
      { value: "baby_care", label: "BABY CARE" },
      { value: "ayurveda_nursing", label: "AYURVEDA NURSING" },
      { value: "panchakarma", label: "PANCHAKARMA THERAPY" },
      { value: "experienced_nurses", label: "EXPERIENCED NURSES" },
      { value: "fresher", label: "FRESHER" },
      { value: "trainee", label: "TRAINEE" },
      { value: "physiotherapy", label: "PHYSIOTHERAPY" },
      { value: "home_nurse", label: "HOME NURSE" },
      { value: "hospital_bystander", label: "HOSPITAL BYSTANDER" },
      { value: "cert_homecare", label: "CERTIFICATE IN HOMECARE NURSING" },
      { value: "diploma_homecare", label: "DIPLOMA IN HOMECARE NURSING" },
      { value: "hha", label: "HOME HEALTH AIDE (HHA) COURSE" },
      { value: "chbhc", label: "CERTIFICATE IN HOME BASED HEALTH CARE (CHBHC)" },
      { value: "caregiver", label: "CAREGIVER TRAINING PROGRAMS" },
      { value: "family_caregiver", label: "FAMILY CAREGIVER TRAINING" },
      { value: "geriatric_care", label: "GERIATRIC CARE ASSISTANT" }
    ]
  };

  const handleAddStaffRequirement = () => {
    const newRequirement: StaffRequirement = {
      staffType: "",
      count: 1,
      shiftType: ""
    };
    onChange([...formData.staffRequirements, newRequirement]);
  };

  const handleRemoveStaffRequirement = (index: number) => {
    if (formData.staffRequirements.length <= 1) return; // Prevent removing last requirement
    const updatedRequirements = formData.staffRequirements.filter((_, i) => i !== index);
    onChange(updatedRequirements);
  };

  const handleStaffRequirementChange = (index: number, field: keyof StaffRequirement, value: string | number) => {
    const updatedRequirements = formData.staffRequirements.map((req, i) => {
      if (i === index) {
        return { ...req, [field]: value };
      }
      return req;
    });
    onChange(updatedRequirements);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (selectedDate >= currentDate) {
      onChange(formData.staffRequirements, selectedDate);
    } else {
      onChange(formData.staffRequirements, currentDate);
    }
  };

  const baseInputStyles = `
    w-full border border-slate-200 bg-white rounded-sm py-2 px-3 text-sm text-gray-800 
    placeholder:text-gray-400
    focus:border-slate-200 focus:outline-none focus:ring-0 
    transition-colors duration-200 appearance-none
  `;
  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="mb-8 border-b border-slate-200 pb-8">
      <h2 className="text-base font-semibold text-gray-800 mb-6">Staffing Requirements</h2>
      
      <div className="space-y-4">
        {formData.staffRequirements.map((requirement, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-4 bg-gray-50 border border-slate-200 rounded-sm">

            <div className="w-full sm:flex-1">
              <label className={labelStyles}>Staff Type</label>
              <select 
                value={requirement.staffType} 
                onChange={(e) => handleStaffRequirementChange(index, 'staffType', e.target.value)}
                className={baseInputStyles}
                style={{ backgroundImage: 'none' }}
              >
                <option value="">Select staff type...</option>
                {staffTypeOptions[clientType]?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-24">
              <label className={labelStyles}>Count</label>
              <input
                type="number"
                min="1"
                value={requirement.count.toString()}
                onChange={(e) => handleStaffRequirementChange(index, 'count', parseInt(e.target.value))}
                className={baseInputStyles}
                placeholder="1"
              />
            </div>

            <div className="w-full sm:w-48">
              <label className={labelStyles}>Shift</label>
              <select 
                value={requirement.shiftType}
                onChange={(e) => handleStaffRequirementChange(index, 'shiftType', e.target.value)}
                className={baseInputStyles}
                style={{ backgroundImage: 'none' }}
              >
                <option value="">Select...</option>
                
                <optgroup label="Standard">
                    <option value="morning_8">Morning (6 AM - 2 PM)</option>
                    <option value="general_9_5">General (9 AM - 5 PM)</option>
                    <option value="night_8">Night (10 PM - 6 AM)</option>
                </optgroup>

                <optgroup label="Long Shift">
                    <option value="day_12">Day (8 AM - 8 PM)</option>
                    <option value="night_12">Night (8 PM - 8 AM)</option>
                </optgroup>

                <optgroup label="Other">
                    <option value="custom">Custom</option>
                </optgroup>
              </select>
            </div>

            {requirement.shiftType === 'custom' && (
              <div className="w-full sm:w-48 animate-in fade-in slide-in-from-left-2 duration-300">
                <label className={labelStyles}>Specify Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM - 3:00 PM"
                  value={requirement.customShiftTiming || ''} 
                  onChange={(e) => handleStaffRequirementChange(index, 'customShiftTiming', e.target.value)}
                  className={baseInputStyles}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => handleRemoveStaffRequirement(index)}
              className="mb-[5px] p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
              title="Remove Requirement"
              disabled={formData.staffRequirements.length <= 1}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddStaffRequirement}
          className="w-full py-2.5 border border-dashed border-slate-200 text-sm font-medium text-gray-600 rounded-sm hover:border-slate-200 hover:bg-gray-50 hover:text-gray-800 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Another Staff Requirement
        </button>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="max-w-xs">
            <label className={labelStyles}>Expected Service Start Date</label>
            <input
              type="date"
              value={formData.staffReqStartDate || ''}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split('T')[0]}
              className={baseInputStyles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};