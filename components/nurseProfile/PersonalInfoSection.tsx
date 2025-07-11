import React from 'react';

interface BasicInfo {
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  phone_number: string | null;
  email: string | null;
  gender: string | null;
  marital_status: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | number | null;
  religion: string | null;
  mother_tongue: string | null;
  service_type: string | null;
  languages: string[] | { [key: string]: string } | null;
  date_of_birth: string | null;
  experience: string | number | null;
  category: string | null;
  shift_pattern: string | null;
}

interface PersonalInfoSectionProps {
  basicInfo: BasicInfo;
  calculateAge: (dateOfBirth: string | null) => number;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ basicInfo, calculateAge }) => {
  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
        Personal Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 font-medium">Name</p>
            <p className="text-sm text-gray-700">
              {basicInfo.first_name} {basicInfo.last_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Address</p>
            <p className="text-sm text-gray-700 break-words max-w-full overflow-hidden">{basicInfo.address}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Phone Number</p>
            <p className="text-sm text-gray-700">{basicInfo.phone_number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Email</p>
            <p className="text-sm text-gray-700">{basicInfo.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Gender</p>
            <p className="text-sm text-gray-700">{basicInfo.gender}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Marital Status</p>
            <p className="text-sm text-gray-700">{basicInfo.marital_status}</p>
          </div>
        </div>

        {/* Location Info */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 font-medium">City</p>
            <p className="text-sm text-gray-700">{basicInfo.city}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">State</p>
            <p className="text-sm text-gray-700">{basicInfo.state}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">PIN Code</p>
            <p className="text-sm text-gray-700">{basicInfo.pin_code}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Religion</p>
            <p className="text-sm text-gray-700">{basicInfo.religion}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Mother Tongue</p>
            <p className="text-sm text-gray-700">{basicInfo.mother_tongue}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Service Type</p>
            <p className="text-sm text-gray-700">{basicInfo.service_type}</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 font-medium">Known Languages</p>
            <p className="text-sm text-gray-700">
              {Array.isArray(basicInfo.languages)
                ? basicInfo.languages.join(', ')
                : typeof basicInfo.languages === 'object' && basicInfo.languages
                ? Object.values(basicInfo.languages).join(', ')
                : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Date of Birth</p>
            <p className="text-sm text-gray-700">
              {basicInfo.date_of_birth
                ? new Date(basicInfo.date_of_birth).toLocaleDateString()
                : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Age</p>
            <p className="text-sm text-gray-700">
              {basicInfo.date_of_birth ? calculateAge(basicInfo.date_of_birth) : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Experience</p>
            <p className="text-sm text-gray-700">{basicInfo.experience} years</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Staff Category</p>
            <p className="text-sm text-gray-700">{basicInfo.category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Shift Pattern</p>
            <p className="text-sm text-gray-700">{basicInfo.shift_pattern}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;