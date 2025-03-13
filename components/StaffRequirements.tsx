import { StaffRequirement } from '@/types/client.types';

interface StaffRequirementsProps {
  clientType: 'organization' | 'hospital' | 'carehome';
  formData: {
    staffRequirements: StaffRequirement[];
    duration: string;
  };
  onChange: (staffRequirements: StaffRequirement[]) => void;
}


export const StaffRequirements = ({ clientType, formData, onChange }: StaffRequirementsProps) => {
  const staffTypeOptions = {
    hospital: [
      { value: "registered_nurse", label: "Registered Nurse" },
      { value: "specialist_nurse", label: "Specialist Nurse" },
      { value: "icu_nurse", label: "ICU Nurse" },
      { value: "pediatric_nurse", label: "Pediatric Nurse" },
      { value: "geriatric_nurse", label: "Geriatric Nurse" }
    ],
    carehome: [
      { value: "caregiver", label: "Caregiver" },
      { value: "nurse", label: "Nurse" },
      { value: "physiotherapist", label: "Physiotherapist" },
      { value: "occupational_therapist", label: "Occupational Therapist" }
    ],
    organization: [
      { value: "nurse", label: "Nurse" },
      { value: "caregiver", label: "Caregiver" },
      { value: "specialist", label: "Specialist" },
      { value: "physiotherapist", label: "Physiotherapist" }
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
                    value={requirement.count}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Contract Duration</label>
        <select 
          value={formData.duration}
          onChange={() => onChange([...formData.staffRequirements])} // Trigger parent update
          className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 font-medium"
        >
          <option value="">Select duration...</option>
          <option value="permanent">Permanent</option>
          <option value="contract_3">3 Months Contract</option>
          <option value="contract_6">6 Months Contract</option>
          <option value="contract_12">12 Months Contract</option>
        </select>
      </div>
    </div>
  );
};