"use client"

import React from "react";
import { formatDate } from "@/utils/formatters";
import { useHousemaidData } from "@/hooks/useHousemaidData";
import InfoField from "./InfoField";
import { Duties } from "@/types/homemaid.types";
import { 
  Calendar, Home, Users, CheckSquare, 
  AlertCircle, Clock, FileText 
} from "lucide-react";

interface HomeMaidPreferencesProps {
  clientId: string;
}

const HomeMaidPreferences: React.FC<HomeMaidPreferencesProps> = ({ clientId }) => {
  const { housemaidRequests, isLoading, error } = useHousemaidData(clientId, true);

  const selectedRequest = housemaidRequests[0];

  if (isLoading) return <div className="py-12 text-center text-gray-500 animate-pulse">Loading preferences...</div>;
  if (error) return <div className="py-12 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>;
  if (!selectedRequest) return <div className="py-12 text-center text-gray-500 italic">No home maid preferences found.</div>;

  const dutiesList = Array.isArray(selectedRequest.duties) 
    ? selectedRequest.duties 
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Service Schedule" icon={<Calendar className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <InfoField label="Service Type" value={selectedRequest.service_type} icon={<Clock className="w-3 h-3"/>} />
            {selectedRequest.service_type_other && (
              <InfoField label="Other Type" value={selectedRequest.service_type_other} />
            )}
            <InfoField label="Frequency" value={selectedRequest.frequency} />
            <InfoField label="Start Date" value={selectedRequest.start_date ? formatDate(selectedRequest.start_date) : "-"} />
            <div className="col-span-2">
               <InfoField label="Preferred Schedule" value={selectedRequest.preferred_schedule} />
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Property Information" icon={<Home className="w-4 h-4" />}>
           <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <InfoField label="Home Type" value={selectedRequest.home_type} />
            <InfoField label="Household Size" value={selectedRequest.household_size?.toString()} />
            <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
               <InfoField label="Bedrooms" value={selectedRequest.bedrooms?.toString()} />
               <InfoField label="Bathrooms" value={selectedRequest.bathrooms?.toString()} />
            </div>
            <InfoField label="Restricted Areas" value={selectedRequest.restricted_areas} />
          </div>
        </SectionCard>
        <SectionCard title="Household & Care Requirements" icon={<Users className="w-4 h-4" />}>
          <div className="space-y-4">
             <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Has Pets" value={selectedRequest.has_pets ? "Yes" : "No"} />
                    {selectedRequest.has_pets && (
                        <InfoField label="Pet Details" value={selectedRequest.pet_details} />
                    )}
                </div>
             </div>
             <div className="grid grid-cols-1 gap-4">
                <InfoField label="Meal Prep" value={selectedRequest.meal_prep_details} fallback="Not requested" />
                <InfoField label="Childcare" value={selectedRequest.childcare_details} fallback="Not requested" />
                <InfoField label="Allergies" value={selectedRequest.allergies} icon={<AlertCircle className="w-3 h-3"/>} fallback="None reported" />
             </div>
          </div>
        </SectionCard>
        <SectionCard title="Duties & Instructions" icon={<CheckSquare className="w-4 h-4" />}>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Requested Duties</p>
              {dutiesList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dutiesList.map((duty: Duties, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {typeof duty === 'string' ? duty : JSON.stringify(duty)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No specific duties selected.</p>
              )}
            </div>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
               <InfoField 
                 label="Special Instructions" 
                 value={selectedRequest.special_instructions} 
                 icon={<FileText className="w-3 h-3"/>}
                 fallback="No special instructions provided."
               />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center gap-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

export default HomeMaidPreferences;