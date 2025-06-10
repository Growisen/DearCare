import { StaffRequirement } from '@/types/client.types';

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

  return (
    <div className="space-y-4">
      {formData.staffRequirements.map((requirement, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">Staff Requirement #{index + 1}</h4>
                <button
                type="button"
                onClick={() => handleRemoveStaffRequirement(index)}
                className="text-red-600 hover:text-red-700 text-sm"
                >
                Remove
                </button>
            </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type Required</label>
                    <select 
                    value={requirement.staffType} 
                    onChange={(e) => handleStaffRequirementChange(index, 'staffType', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <option value="" className="text-gray-500">Select staff type...</option>
                    {staffTypeOptions[clientType].map(option => (
                        <option key={option.value} value={option.value} className="text-gray-900 font-medium">
                        {option.label}
                        </option>
                    ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Staff</label>
                    <input
                    type="number"
                    min="1"
                    value={requirement.count.toString()}
                    onChange={(e) => handleStaffRequirementChange(index, 'count', parseInt(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter number of staff"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                    <select 
                    value={requirement.shiftType}
                    onChange={(e) => handleStaffRequirementChange(index, 'shiftType', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <option value="" className="text-gray-500">Select shift type...</option>
                    <option value="day" className="text-gray-900 font-medium">Day Shift (8 AM - 8 PM)</option>
                    <option value="night" className="text-gray-900 font-medium">Night Shift (8 PM - 8 AM)</option>
                    <option value="rotating" className="text-gray-900 font-medium">Rotating Shifts</option>
                    <option value="custom" className="text-gray-900 font-medium">Custom Hours</option>
                    </select>
                </div>
            </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddStaffRequirement}
        className="w-full py-2 px-4 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-200"
      >
        + Add Another Staff Requirement
      </button>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Service Start Date</label>
        <input
          type="date"
          value={formData.staffReqStartDate || ''}
          onChange={handleStartDateChange}
          min={new Date().toISOString().split('T')[0]}
          className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};