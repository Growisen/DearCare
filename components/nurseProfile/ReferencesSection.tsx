import React from 'react'

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
  
  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
        References
      </h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Primary Reference
          </h3>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Name:</span> {referencesInfo.referer_name}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Relation:</span> {referencesInfo.relation}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Phone:</span> {referencesInfo.phone_number}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Description:</span> {referencesInfo.description}
              </p>
            </div>
          </div>
        </div>

        {referencesInfo.staff_reference && (
          <div>
            <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Staff Reference
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Name:</span> {referencesInfo.staff_reference.name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Relation:</span> {referencesInfo.staff_reference.relation}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Phone:</span> {referencesInfo.staff_reference.phone}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Description:</span> {referencesInfo.staff_reference.recommendation_details}
                </p>
              </div>
            </div>
          </div>
        )}

        {referencesInfo.family_references && (
          <div>
            <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Family References
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.isArray(referencesInfo.family_references) && referencesInfo.family_references.map((ref, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Name:</span> {ref.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Relation:</span> {ref.relation}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Phone:</span> {ref.phone}
                    </p>
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