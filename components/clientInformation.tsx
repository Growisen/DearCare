import React from 'react';

interface ClientInformationProps {
  client: {
    name: string;
    service: string;
    email: string;
    phone: string;
  };
}

export function ClientInformation({ client }: ClientInformationProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Name</dt>
          <dd className="text-sm text-gray-900">{client.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Service</dt>
          <dd className="text-sm text-gray-900">{client.service}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
          <dd className="text-sm text-gray-900">{client.email}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
          <dd className="text-sm text-gray-900">{client.phone}</dd>
        </div>
      </dl>
    </div>
  );
}