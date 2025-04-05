import React from 'react';
import { Mail, Phone, Briefcase, User } from 'lucide-react';
import { NurseBasicInfo } from '@/types/staff.types';
interface NurseInformationProps {
  nurse: NurseBasicInfo;
}

export function NurseInformation({ nurse }: NurseInformationProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        {/* Profile Image Section */}
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-12 h-12 text-gray-400" />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold text-gray-800">
            {`${nurse.first_name || ''} ${nurse.last_name || ''}`}
          </h2>
          <p className="text-sm text-gray-500">Registered Nurse</p>
          <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
            <span className={`px-2 py-1 inline-flex text-xs rounded-full font-medium
              ${nurse.status === 'assigned' ? 'bg-green-100 text-green-800' : 
                nurse.status === 'unassigned' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}>
              {nurse.status}
            </span>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800">Contact Information</h3>
          
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm text-gray-800">{nurse.email || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm text-gray-800">{nurse.phone_number || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800">Professional Information</h3>

          <div className="flex items-center space-x-3">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Experience</p>
              <p className="text-sm text-gray-800">
                {nurse.experience || 0} years
                <span className="text-gray-500 ml-1">of professional experience</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}