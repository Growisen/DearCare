import React, { useEffect, useRef, useState } from 'react';
import { FormStepProps } from '@/types/agreement.types';
import { fetchApprovedClientNames } from '@/app/actions/clients/client-core';

type ApprovedClient = {
  client_id: string;
  registration_number: string;
  patient_name: string;
  patient_state: string;
  patient_district: string;
  patient_city: string;
  client_type: string;
};

export const ClientInfoStep: React.FC<FormStepProps> = ({
  formData,
  onFormChange,
  onNext
}) => {
  const [searchName, setSearchName] = useState(formData.name || '');
  const [clients, setClients] = useState<ApprovedClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<ApprovedClient | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (searchName.trim() === '') {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      const result = await fetchApprovedClientNames(searchName);
      setClients(result.data || []);
      setLoading(false);
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchName]);


  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              value={selectedClient ? (selectedClient.patient_name || "") : (searchName || "")}
              onChange={e => {
                onFormChange(e);
                setSearchName(e.target.value);
                setSelectedClient(null);
              }}
              placeholder="Start typing to search..."
              className="h-9 w-full min-w-0 rounded-md border border-slate-300 bg-transparent px-3 py-1 
              text-base shadow-sm transition-all outline-none placeholder:text-slate-400 disabled:pointer-events-none 
              disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-blue-500 focus-visible:ring-[3px] 
              focus-visible:ring-blue-500/20"
              disabled={!!selectedClient}
            />
            {searchName && !selectedClient && (
              <div className="absolute z-10 bg-white border rounded-md mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                {loading ? (
                  <div className="p-2 text-gray-500 text-sm">Loading...</div>
                ) : clients.length === 0 ? (
                  <div className="p-2 text-gray-500 text-sm">No clients found</div>
                ) : (
                  clients.map(client => (
                    <button
                      type="button"
                      key={client.client_id}
                      className="w-full text-gray-700 text-left px-3 py-2 hover:bg-blue-50"
                      onClick={() => {
                        setSelectedClient(client);
                        setSearchName('');
                        onFormChange({
                          target: { name: 'name', value: client.patient_name }
                        } as React.ChangeEvent<HTMLInputElement>);
                        onFormChange({
                          target: { name: 'state', value: client.patient_state }
                        } as React.ChangeEvent<HTMLInputElement>);
                        onFormChange({
                          target: { name: 'district', value: client.patient_district }
                        } as React.ChangeEvent<HTMLInputElement>);
                        onFormChange({
                          target: { name: 'city', value: client.patient_city }
                        } as React.ChangeEvent<HTMLInputElement>);
                        onFormChange({
                          target: { name: 'type', value: client.client_type }
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                    >
                      {client.patient_name} ({client.registration_number})
                    </button>
                  ))
                )}
              </div>
            )}
            {selectedClient && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                {selectedClient.patient_name} ({selectedClient.registration_number})
                <button
                  type="button"
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSelectedClient(null);
                    setSearchName('');
                    onFormChange({
                      target: { name: 'name', value: '' }
                    } as React.ChangeEvent<HTMLInputElement>);
                    onFormChange({
                      target: { name: 'state', value: '' }
                    } as React.ChangeEvent<HTMLInputElement>);
                    onFormChange({
                      target: { name: 'district', value: '' }
                    } as React.ChangeEvent<HTMLInputElement>);
                    onFormChange({
                      target: { name: 'city', value: '' }
                    } as React.ChangeEvent<HTMLInputElement>);
                    onFormChange({
                      target: { name: 'type', value: '' }
                    } as React.ChangeEvent<HTMLInputElement>);
                    onFormChange({
                      target: { name: 'clientRequirement', value: '' }
                    } as React.ChangeEvent<HTMLInputElement>);
                    onFormChange({
                      target: { name: 'patientDiagnosis', value: '' }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <label htmlFor="type" className="block text-sm font-medium text-slate-700">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type || ""}
            onChange={onFormChange}
            className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-sm 
            outline-none md:text-sm focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          >
            <option value="">Select type</option>
            <option value="individual">Individual Client</option>
            <option value="organization">Organization</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label htmlFor="state" className="block text-sm font-medium text-slate-700">
            State <span className="text-red-500">*</span>
          </label>
          <input
            id="state"
            name="state"
            type="text"
            value={formData.state || ""}
            onChange={onFormChange}
            placeholder="Enter state"
            className="h-9 w-full min-w-0 rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-sm 
            transition-all outline-none placeholder:text-slate-400 disabled:pointer-events-none disabled:cursor-not-allowed 
            disabled:opacity-50 md:text-sm focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label htmlFor="district" className="block text-sm font-medium text-slate-700">
            District <span className="text-red-500">*</span>
          </label>
          <input
            id="district"
            name="district"
            type="text"
            value={formData.district || ""}
            onChange={onFormChange}
            placeholder="Enter district"
            className="h-9 w-full min-w-0 rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-sm transition-all 
            outline-none placeholder:text-slate-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm
             focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label htmlFor="city" className="block text-sm font-medium text-slate-700">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city || ""}
            onChange={onFormChange}
            placeholder="Enter city"
            className="h-9 w-full min-w-0 rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-sm
            transition-all outline-none placeholder:text-slate-400 disabled:pointer-events-none disabled:cursor-not-allowed 
            disabled:opacity-50 md:text-sm focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
        <div className="flex-1" />
      </div>

      <div className="flex space-x-1">
        <div className="flex-1 space-y-2">
          <label htmlFor="clientRequirement" className="block text-sm font-medium text-slate-700">
            Client Requirement
          </label>
          <textarea
            id="clientRequirement"
            name="clientRequirement"
            rows={3}
            value={formData.clientRequirement || ""}
            onChange={onFormChange}
            placeholder="Describe client requirements"
            className="w-full min-w-0 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-base 
            shadow-sm outline-none md:text-sm focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 space-y-2">
          <label htmlFor="patientDiagnosis" className="block text-sm font-medium text-slate-700">
            Patient Diagnosis
          </label>
          <textarea
            id="patientDiagnosis"
            name="patientDiagnosis"
            rows={3}
            value={formData.patientDiagnosis || ""}
            onChange={onFormChange}
            placeholder="Describe patient diagnosis"
            className="w-full min-w-0 rounded-md border border-slate-300 bg-transparent px-3 py-2 
            text-base shadow-sm outline-none md:text-sm focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex items-center justify-end pt-6 border-t border-slate-200">
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white
          shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          Next
        </button>
      </div>
    </div>
  );
};