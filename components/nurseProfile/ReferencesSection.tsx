import React from 'react';

interface FamilyReference {
  name: string | null;
  relation: string | null;
  phone: string | null;
}

interface StaffReference {
  name: string | null;
  relation: string | null;
  phone: string | null;
  recommendation_details?: string | null;
}

interface ReferencesInfo {
  referer_name: string | null;
  relation: string | null;
  phone_number: string | null;
  description: string | null;
  family_references?: FamilyReference[] | null;
  staff_reference?: StaffReference | null;
}

interface ReferencesSectionProps {
  referencesInfo: ReferencesInfo | null;
}

const ReferencesSection: React.FC<ReferencesSectionProps> = ({ referencesInfo }) => {
  if (!referencesInfo) return null;

  const displayValue = (value: string | null | undefined) =>
    value && value.trim() !== '' ? value : 'N/A';

  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
        References
      </h2>

      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded border border-gray-200 w-full flex flex-col">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Primary Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 font-medium">Name</p>
                <p className="text-sm text-gray-700">
                  {displayValue(referencesInfo.referer_name)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Relation</p>
                <p className="text-sm text-gray-700">
                  {displayValue(referencesInfo.relation)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="text-sm text-gray-700">
                  {displayValue(referencesInfo.phone_number)}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 font-medium">Description</p>
                <p className="text-sm text-gray-700">
                  {displayValue(referencesInfo.description)}
                </p>
              </div>
            </div>
          </div>

          {referencesInfo.staff_reference && (
            <div className="bg-gray-50 p-3 rounded border border-gray-200 w-full flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
                Staff Reference
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Name</p>
                  <p className="text-sm text-gray-700">
                    {displayValue(referencesInfo.staff_reference.name)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Relation</p>
                  <p className="text-sm text-gray-700">
                    {displayValue(referencesInfo.staff_reference.relation)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm text-gray-700">
                    {displayValue(referencesInfo.staff_reference.phone)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Description</p>
                  <p className="text-sm text-gray-700">
                    {displayValue(referencesInfo.staff_reference.recommendation_details)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {referencesInfo.family_references && referencesInfo.family_references.length > 0 && (
          <div className="bg-gray-50 p-3 rounded border border-gray-200 w-full flex flex-col">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Family References
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referencesInfo.family_references.map((ref, index) => (
                <div key={index} className="bg-white p-3 rounded border border-gray-200">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Name</p>
                      <p className="text-sm text-gray-700">{displayValue(ref.name)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Relation</p>
                      <p className="text-sm text-gray-700">{displayValue(ref.relation)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone</p>
                      <p className="text-sm text-gray-700">{displayValue(ref.phone)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferencesSection;
