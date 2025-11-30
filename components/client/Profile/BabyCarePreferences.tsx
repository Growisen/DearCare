"use client"

import React, { useState } from "react";
import { formatDate } from "@/utils/formatters";
import { useChildCarePreferences } from "@/hooks/useChildCarePreferences"
import InfoField from "./InfoField";
import { 
  Baby, HeartHandshake, ClipboardList, 
  Sparkles, FileText, User, Clock
} from "lucide-react";
import EditBabyCareForm from "@/components/open-form/EditBabyCareForm";
import ModalPortal from "@/components/ui/ModalPortal";

interface ChildCarePreferencesProps {
  clientId: string;
}

const ChildCarePreferences: React.FC<ChildCarePreferencesProps> = ({ clientId }) => {
  const { 
    childCareRequests, isLoading, error, 
    editChildCarePreferences 
  } = useChildCarePreferences(clientId, true);
  
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const selectedRequest = childCareRequests?.[0];

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const getActiveTags = (jsonObj: Record<string, boolean> | null) => {
    if (!jsonObj) return [];
    return Object.entries(jsonObj)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value === true)
      .map(([key]) => formatKey(key));
  };

  const CopyLinkButton = (
    <button
      className={`px-4 py-2 rounded flex items-center gap-1 ${
        copySuccess
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      onClick={() => {
        navigator.clipboard.writeText(`/child-care-preferences/${clientId}`);
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
      href={`/child-care-preferences/${clientId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 rounded flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
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
    <div className="py-12 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
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
      No child care preferences found.
    </div>
  );

  const careNeedsList = getActiveTags(selectedRequest.careNeeds);
  const homeTasksList = getActiveTags(selectedRequest.homeTasks);
  
  const focusMap: Record<string, string> = {
    'child_care_priority': 'Child Care Priority',
    'both_equal': 'Equal Attention (Care & Home)'
  };

  const handleEditSubmit = (data: Partial<typeof selectedRequest>) => {
    editChildCarePreferences(data);
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

        <SectionCard title="Child Details" icon={<Baby className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <InfoField 
                label="Number of Children" 
                value={selectedRequest.numberOfChildren} 
                icon={<User className="w-3 h-3"/>}
            />
            <InfoField 
                label="Ages" 
                value={selectedRequest.agesOfChildren} 
                icon={<Clock className="w-3 h-3"/>}
            />
            
            <div className="col-span-2 mt-2">
                <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Care Needs</p>
                {careNeedsList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-3">
                    {careNeedsList.map((need, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                        {need}
                        </span>
                    ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic mb-3">No specific care needs flagged.</p>
                )}
                
                {selectedRequest.careNeedsDetails && (
                   <InfoField label="Specific Health/Care Details" value={selectedRequest.careNeedsDetails} />
                )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Duties & Focus" icon={<HeartHandshake className="w-4 h-4" />}>
           <div className="space-y-6">
             <div className="grid grid-cols-1 gap-4">
                <InfoField 
                    label="Primary Focus" 
                    value={focusMap[selectedRequest.primaryFocus] || selectedRequest.primaryFocus} 
                    icon={<Sparkles className="w-3 h-3 text-amber-500"/>}
                />
             </div>
             
             <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Housekeeping Tasks</p>
                {homeTasksList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                    {homeTasksList.map((task, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {task}
                        </span>
                    ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">No housekeeping tasks requested.</p>
                )}
             </div>

             {selectedRequest.homeTasksDetails && (
                 <InfoField 
                    label="Other Task Details" 
                    value={selectedRequest.homeTasksDetails} 
                 />
             )}
           </div>
        </SectionCard>

        <div className="lg:col-span-2">
            <SectionCard title="Additional Notes" icon={<ClipboardList className="w-4 h-4" />}>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <InfoField 
                        label="Parent Notes" 
                        value={selectedRequest.notes} 
                        icon={<FileText className="w-3 h-3"/>}
                        fallback="No additional notes provided."
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <span className="text-xs text-gray-400">
                        Request created: {formatDate(selectedRequest.createdAt)}
                    </span>
                </div>
            </SectionCard>
        </div>

      </div>

      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-sm shadow-lg p-6 relative w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 border-b pb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Edit Child Care Preferences
                </h2>
                <button
                  className="text-2xl text-gray-500 hover:text-gray-700"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              <EditBabyCareForm 
                initialData={selectedRequest} 
                onSubmit={handleEditSubmit} 
              />
            </div>
          </div>
        </ModalPortal>
      )}
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

export default ChildCarePreferences;