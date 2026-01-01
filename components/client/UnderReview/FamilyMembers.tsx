import React from 'react';

type FamilyMember = {
  id: string;
  name: string;
  age: string;
  job: string;
  relation: string;
  medicalRecords: string;
};

type FamilyMembersProps = {
  familyMembers: FamilyMember[];
  onAddFamilyMember: () => void;
  onRemoveFamilyMember: (id: string) => void;
  onFamilyMemberChange: (id: string, field: keyof FamilyMember, value: string) => void;
};

export default function FamilyMembers({ 
  familyMembers, 
  onAddFamilyMember, 
  onRemoveFamilyMember, 
  onFamilyMemberChange 
}: FamilyMembersProps) {
  return (
    <div className="bg-white p-6 rounded-sm border border-slate-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="p-1.5 bg-amber-100 rounded-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </span>
        Family Members
      </h2>
      
      <div className="space-y-6">
        {familyMembers.map((member) => (
          <div key={member.id} className="p-4 border border-slate-200 rounded-sm bg-gray-50">
            <div className="flex justify-between mb-3">
              <h3 className="font-medium text-gray-800">Family Member Details</h3>
              <button
                type="button"
                onClick={() => onRemoveFamilyMember(member.id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`name-${member.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id={`name-${member.id}`}
                  value={member.name}
                  onChange={(e) => onFamilyMemberChange(member.id, 'name', e.target.value)}
                  className="w-full p-2 border text-gray-800 border-slate-200 rounded-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor={`age-${member.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="text"
                  id={`age-${member.id}`}
                  value={member.age}
                  onChange={(e) => onFamilyMemberChange(member.id, 'age', e.target.value)}
                  className="w-full p-2 border text-gray-800 border-slate-200 rounded-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor={`job-${member.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Job/Occupation
                </label>
                <input
                  type="text"
                  id={`job-${member.id}`}
                  value={member.job}
                  onChange={(e) => onFamilyMemberChange(member.id, 'job', e.target.value)}
                  className="w-full p-2 border text-gray-800 border-slate-200 rounded-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor={`relation-${member.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Relation with Patient
                </label>
                <input
                  type="text"
                  id={`relation-${member.id}`}
                  value={member.relation}
                  onChange={(e) => onFamilyMemberChange(member.id, 'relation', e.target.value)}
                  className="w-full p-2 border text-gray-800 border-slate-200 rounded-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor={`medicalRecords-${member.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Records/History
                </label>
                <textarea
                  id={`medicalRecords-${member.id}`}
                  value={member.medicalRecords}
                  onChange={(e) => onFamilyMemberChange(member.id, 'medicalRecords', e.target.value)}
                  rows={3}
                  className="w-full p-2 border text-gray-800 border-slate-200 rounded-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={onAddFamilyMember}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-200 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Family Member
        </button>
      </div>
    </div>
  );
}