"use client"

import React, { useState } from "react";
import { formatDate } from "@/utils/formatters";
import { useHousemaidData } from "@/hooks/useHousemaidData";
import InfoField from "./InfoField";
import { 
  Calendar, Home, Users, CheckSquare, 
  AlertCircle, Clock, FileText 
} from "lucide-react";
import EditHomeMaidForm from "@/components/open-form/EditHomeMaidForm";
import ModalPortal from "@/components/ui/ModalPortal";

interface HomeMaidPreferencesProps {
  clientId: string;
}

const HomeMaidPreferences: React.FC<HomeMaidPreferencesProps> = ({ clientId }) => {
  const { 
    housemaidRequests, isLoading, error, 
    editHousemaidPreferences 
  } = useHousemaidData(clientId, true);
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const selectedRequest = housemaidRequests[0];

  const CopyLinkButton = (
    <button
      className={`px-4 py-2 rounded flex items-center gap-1 ${
        copySuccess
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      onClick={() => {
        const fullLink = `${window.location.origin}/home-maid-preferences/${clientId}`;
        navigator.clipboard.writeText(fullLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      }}
      title="Copy full link to open form"
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M15 7h2a5 5 0 0 1 0 10h-2M9 17H7a5 5 0 0 1 0-10h2" />
        <path d="M8 12h8" />
      </svg>
      {copySuccess ? "Copied!" : "Copy Link"}
    </button>
  );

  const ExternalLinkButton = (
    <a
      href={`/home-maid-preferences/${clientId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 rounded flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-slate-200"
      title="Open preferences in new tab"
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
      Open in New Tab
    </a>
  );

  if (isLoading) return (
    <div className="py-12 text-center text-gray-500 animate-pulse">
      <div className="flex justify-end mb-4 space-x-2">
        {CopyLinkButton}
        {ExternalLinkButton}
      </div>
      Loading preferences...
    </div>
  );
  if (error) return (
    <div className="py-12 text-center text-red-600 bg-red-50 rounded-sm border border-red-100">
      <div className="flex justify-end mb-4 space-x-2">
        {CopyLinkButton}
        {ExternalLinkButton}
      </div>
      {error}
    </div>
  );
  if (!selectedRequest) return (
    <div className="py-12 text-center text-gray-500 italic">
      <div className="flex justify-end mb-4 space-x-2">
        {CopyLinkButton}
        {ExternalLinkButton}
      </div>
      No home maid preferences found.
    </div>
  );

  const dutiesList = selectedRequest.duties && typeof selectedRequest.duties === "object"
    ? Object.entries(selectedRequest.duties)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value === true)
        .map(([key]) => key)
    : [];

  const initialData = {
    serviceType: selectedRequest.service_type,
    serviceTypeOther: selectedRequest.service_type_other,
    frequency: selectedRequest.frequency,
    preferredSchedule: selectedRequest.preferred_schedule,
    homeType: selectedRequest.home_type,
    householdSize: selectedRequest.household_size,
    bedrooms: selectedRequest.bedrooms,
    bathrooms: selectedRequest.bathrooms,
    restrictedAreas: selectedRequest.restricted_areas,
    hasPets: selectedRequest.has_pets,
    petDetails: selectedRequest.pet_details,
    mealPrepDetails: selectedRequest.meal_prep_details,
    childcareDetails: selectedRequest.childcare_details,
    allergies: selectedRequest.allergies,
    duties: selectedRequest.duties,
    specialInstructions: selectedRequest.special_instructions,
  };

  const handleEditSubmit = (data: typeof initialData) => {
    editHousemaidPreferences(data);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-end mb-4 space-x-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          Edit
        </button>
        {/* {CopyLinkButton}
        {ExternalLinkButton} */}
      </div>
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
            <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-sm border border-slate-200">
               <InfoField label="Bedrooms" value={selectedRequest.bedrooms?.toString()} />
               <InfoField label="Bathrooms" value={selectedRequest.bathrooms?.toString()} />
            </div>
            <InfoField label="Restricted Areas" value={selectedRequest.restricted_areas} />
          </div>
        </SectionCard>
        <SectionCard title="Household & Care Requirements" icon={<Users className="w-4 h-4" />}>
          <div className="space-y-4">
             <div className="border-b border-slate-200 pb-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Has Pets" value={selectedRequest.has_pets ? "Yes" : "No"} />
                    {selectedRequest.has_pets && (
                        <InfoField label="Pet Details" value={selectedRequest.pet_details} />
                    )}
                </div>
             </div>
             <div className="grid grid-cols-1 gap-4">
                <InfoField label="Meal Prep" value={selectedRequest.meal_prep_details} fallback="Not requested" />
                <InfoField label="Childcare Assistance Requirement" value={selectedRequest.childcare_details} fallback="Not requested" />
                <InfoField label="Allergies" value={selectedRequest.allergies} icon={<AlertCircle className="w-3 h-3"/>} fallback="None reported" />
             </div>
          </div>
        </SectionCard>
        <SectionCard title="Duties & Instructions" icon={<CheckSquare className="w-4 h-4" />}>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Core Cleaning Duties Requested</p>
              {dutiesList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dutiesList.map((duty: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {duty}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No specific duties selected.</p>
              )}
            </div>
            <div className="bg-amber-50 p-4 rounded-sm border border-amber-100">
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
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-sm shadow-lg p-6 relative w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 border-b pb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Edit Home Maid Preferences
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <EditHomeMaidForm initialData={initialData} onSubmit={handleEditSubmit} />
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

const SectionCard = ({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-white rounded-sm border border-slate-200 shadow-none overflow-hidden h-full">
    <div className="bg-gray-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

export default HomeMaidPreferences;