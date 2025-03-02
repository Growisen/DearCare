import React from 'react';
import { X } from 'lucide-react';
import { AddClientProps } from '@/types/client.types';

const InputField = ({ label, type = 'text', placeholder }: { label: string, type?: string, placeholder: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={label.toLowerCase().replace(/ /g, '-')}>{label}</label>
    <input
      type={type}
      id={label.toLowerCase().replace(/ /g, '-')}
      className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
      placeholder={placeholder}
      aria-label={label}
    />
  </div>
);

export function AddClientOverlay({ onClose, onAdd }: AddClientProps) {
  const getInputValue = (placeholder: string) => (document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement)?.value;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors duration-200" aria-label="Close">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Full Name', 'Phone Number', 'Email Address'].map((label, idx) => (
              <InputField key={idx} label={label} placeholder={`Enter ${label.toLowerCase()}`} />
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="service-required">Service Required</label>
              <select id="service-required" className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" aria-label="Service Required">
                <option value="">Select service...</option>
                <option value="home_care">Home Care</option>
                <option value="elder_care">Elder Care</option>
                <option value="post_surgery">Post-Surgery Care</option>
                <option value="physiotherapy">Physiotherapy</option>
              </select>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Details</h3>
            <div className="space-y-4">
              <InputField label="Medical Condition" placeholder="Enter medical condition" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="care-description">Care Description</label>
                <textarea
                  id="care-description"
                  className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[100px]"
                  placeholder="Describe care requirements..."
                  aria-label="Care Description"
                ></textarea>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <button onClick={onClose} className="px-5 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition duration-200" aria-label="Cancel">
              Cancel
            </button>
            <button
              onClick={() => {
                const client = {
                  fullName: getInputValue('Enter full name'),
                  phoneNumber: getInputValue('Enter phone number'),
                  emailAddress: getInputValue('Enter email address'),
                  serviceRequired: (document.querySelector('select') as HTMLSelectElement)?.value,
                  medicalCondition: getInputValue('Enter medical condition'),
                  careDescription: (document.querySelector('textarea[placeholder="Describe care requirements..."]') as HTMLTextAreaElement)?.value,
                };
                onAdd(client);
              }}
              className="flex-1 px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              aria-label="Add Client"
            >
              Add Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
