import React from 'react';
import InfoSection from './InfoSection';
import InfoField from './InfoField';
import { formatDate } from '@/utils/formatters';

interface ServiceDetails {
  serviceRequired?: string;
  status?: string | null;
  startDate?: string;
  serviceLocation?: string;
  serviceFrequency?: string;
  serviceHours?: string;
  specialRequirements?: string;
  preferredCaregiverGender?: string;
}

interface ServiceDetailsSectionProps {
  serviceDetails: ServiceDetails;
}

const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = ({
  serviceDetails
}) => {
  const {
    serviceRequired,
    status,
    startDate,
    serviceLocation,
    serviceFrequency,
    serviceHours,
    specialRequirements,
    preferredCaregiverGender
  } = serviceDetails || {};

  const getStatusDisplay = () => {
    if (!status) return null;

    const statusColors: Record<string, string> = {
      'approved': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'active': 'bg-blue-100 text-blue-800',
      'completed': 'bg-gray-100 text-gray-800'
    };

    const color = statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${color} capitalize`}>
        {status}
      </span>
    );
  };

  return (
    <InfoSection title="Service Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <p className="text-xs text-gray-500 font-medium">Service Required</p>
          <p className="text-sm text-gray-700">{serviceRequired || 'Not specified'}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 font-medium">Status</p>
          <div>{getStatusDisplay() || <p className="text-sm text-gray-700">Not specified</p>}</div>
        </div>

        {startDate && (
          <div>
            <p className="text-xs text-gray-500 font-medium">Service Start Date</p>
            <p className="text-sm text-gray-700">{formatDate(startDate)}</p>
          </div>
        )}

        {serviceLocation && (
          <InfoField label="Service Location" value={serviceLocation} />
        )}

        {serviceFrequency && (
          <InfoField label="Service Frequency" value={serviceFrequency} />
        )}

        {serviceHours && (
          <InfoField label="Service Hours" value={serviceHours} />
        )}

        <div>
          <p className="text-xs text-gray-500 font-medium">Preferred Care Giver Gender</p>
          <p className="text-sm text-gray-700">{preferredCaregiverGender || 'Not specified'}</p>
        </div>

        {specialRequirements && (
          <div className="col-span-full">
            <p className="text-xs text-gray-500 font-medium">Special Requirements</p>
            <p className="text-sm text-gray-700">{specialRequirements}</p>
          </div>
        )}
      </div>
    </InfoSection>
  );
};

export default ServiceDetailsSection;