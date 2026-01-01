"use client"

import React, { useState } from "react";
import { formatDate } from "@/utils/formatters";
import { useDeliveryCareRequests } from "@/hooks/useDeliveryCareRequests";
import InfoField from "./InfoField";
import { Calendar, Truck, Users, AlertCircle } from "lucide-react";
import EditDeliveryCareForm from "@/components/open-form/EditDeliveryCareForm";
import ModalPortal from "@/components/ui/ModalPortal";

interface DeliveryCarePreferencesProps {
  clientId: string;
}

const DeliveryCarePreferences: React.FC<DeliveryCarePreferencesProps> = ({ clientId }) => {
  const {
    deliveryCareRequests, isLoading, error,
    editDeliveryCareRequest
  } = useDeliveryCareRequests(clientId, true);

  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const selectedRequest = deliveryCareRequests[0];

  const carePreferredOptions = {
    post_delivery: "Post-Delivery Care",
    pre_delivery: "Pre-Delivery Care",
    on_delivery: "On-Delivery Care",
  };

  const CopyLinkButton = (
    <button
      className={`px-4 py-2 rounded flex items-center gap-1 ${
        copySuccess
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      onClick={() => {
        navigator.clipboard.writeText(`/delivery-care-preferences/${clientId}`);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      }}
      title="Copy link to open form"
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
      href={`/delivery-care-preferences/${clientId}`}
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
      No delivery care preferences found.
    </div>
  );

  const initialData = {
    carePreferred: selectedRequest.carePreferred,
    deliveryDate: selectedRequest.deliveryDate,
    deliveryType: selectedRequest.deliveryType,
    motherAllergies: selectedRequest.motherAllergies,
    motherMedications: selectedRequest.motherMedications,
    numberOfBabies: selectedRequest.numberOfBabies,
    feedingMethod: selectedRequest.feedingMethod,
    babyAllergies: selectedRequest.babyAllergies,
    preferredSchedule: selectedRequest.preferredSchedule,
    duties: selectedRequest.duties,
    expectedDueDate: selectedRequest.expectedDueDate,
    backupContactName: selectedRequest.backupContactName,
    backupContactNumber: selectedRequest.backupContactNumber,
    hospitalName: selectedRequest.hospitalName,
    doctorName: selectedRequest.doctorName,
    medicalHistory: selectedRequest.medicalHistory,
    birthDateTime: selectedRequest.birthDateTime,
    roomDetails: selectedRequest.roomDetails,
    babyGender: selectedRequest.babyGender,
    babyWeight: selectedRequest.babyWeight,
  };

  const handleEditSubmit = (data: typeof initialData) => {
    editDeliveryCareRequest(data);
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
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Delivery Details" icon={<Truck className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <InfoField
              label="Preferred Care"
              value={
                carePreferredOptions[
                  selectedRequest.carePreferred as keyof typeof carePreferredOptions
                ] || selectedRequest.carePreferred
              }
            />
            <InfoField label="Delivery Date" value={selectedRequest.deliveryDate ? formatDate(selectedRequest.deliveryDate) : "-"} />
            <InfoField label="Delivery Type" value={selectedRequest.deliveryType} />
            <InfoField label="Expected Due Date" value={selectedRequest.expectedDueDate} />
            <InfoField label="Birth Date & Time" value={selectedRequest.birthDateTime} />
            <InfoField label="Room Details" value={selectedRequest.roomDetails} />
          </div>
        </SectionCard>
        <SectionCard title="Mother & Baby" icon={<Users className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <InfoField label="Mother Allergies" value={selectedRequest.motherAllergies} />
            <InfoField label="Mother Medications" value={selectedRequest.motherMedications} />
            <InfoField label="Number of Babies" value={selectedRequest.numberOfBabies} />
            <InfoField label="Feeding Method" value={selectedRequest.feedingMethod} />
            <InfoField label="Baby Allergies" value={selectedRequest.babyAllergies} />
            <InfoField label="Baby Gender" value={selectedRequest.babyGender} />
            <InfoField label="Baby Weight" value={selectedRequest.babyWeight} />
          </div>
        </SectionCard>
        <SectionCard title="Contacts & Schedule" icon={<Calendar className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <InfoField label="Preferred Schedule" value={selectedRequest.preferredSchedule} />
            <InfoField label="Backup Contact Name" value={selectedRequest.backupContactName} />
            <InfoField label="Backup Contact Number" value={selectedRequest.backupContactNumber} />
            <InfoField label="Hospital Name" value={selectedRequest.hospitalName} />
            <InfoField label="Doctor Name" value={selectedRequest.doctorName} />
          </div>
        </SectionCard>
        <SectionCard title="Other Details" icon={<AlertCircle className="w-4 h-4" />}>
          <div className="space-y-4">
            <InfoField label="Medical History" value={selectedRequest.medicalHistory} />
            <InfoField label="Duties" value={
              `Baby Care: ${selectedRequest.duties?.babyCare ? "Yes" : "No"}, Mother Care: ${selectedRequest.duties?.motherCare ? "Yes" : "No"}`
            } />
          </div>
        </SectionCard>
      </div>
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-sm shadow-lg p-6 relative w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 border-b pb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Edit Delivery Care Preferences
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <EditDeliveryCareForm initialData={initialData} onSubmit={handleEditSubmit} />
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

export default DeliveryCarePreferences;