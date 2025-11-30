'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import DeliveryCareForm from '@/components/open-form/DeliveryCareForm';
import { getClientNames } from '@/app/actions/clients/assessment';
import { addDeliveryCareRequest, isDeliveryCareRequestSubmitted } from '@/app/actions/clients/individual-clients';
import { notFound } from 'next/navigation';
import { DeliveryCareFormData } from '@/types/deliveryCare.types';

export default function DeliveryCareRequirementsPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientNames, setClientNames] = useState<{ patientName?: string; requestorName?: string; clientCategory?: string } | null>(null);
  const [nameLoading, setNameLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [formData, setFormData] = useState<DeliveryCareFormData>({
    carePreferred: 'post_delivery',
    deliveryDate: '',
    deliveryType: '',
    motherAllergies: '',
    motherMedications: '',
    numberOfBabies: '',
    feedingMethod: '',
    babyAllergies: '',
    preferredSchedule: '',
    duties: {
      babyCare: false,
      motherCare: false,
    },
    expectedDueDate: '',
    backupContactName: '',
    backupContactNumber: '',
    hospitalName: '',
    doctorName: '',
    medicalHistory: '',
    birthDateTime: '',
    roomDetails: '',
    babyGender: '',
    babyWeight: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDutyChange = (key: keyof DeliveryCareFormData['duties']) => {
    setFormData(prev => ({
      ...prev,
      duties: {
        ...prev.duties,
        [key]: !prev.duties[key],
      },
    }));
  };

  useEffect(() => {
    async function checkSubmissionAndFetchName() {
      setNameLoading(true);

      const submissionStatus = await isDeliveryCareRequestSubmitted(id as string);
      if (submissionStatus.submitted) {
        setAlreadySubmitted(true);
        setNameLoading(false);
        return;
      }

      const result = await getClientNames(id as string);
      if (result.success) {
        setClientNames({
          patientName: result.patientName,
          requestorName: result.requestorName,
          clientCategory: result.clientCategory,
        });
      } else {
        setClientNames(null);
      }
      setNameLoading(false);

      if (
        !result.patientName &&
        !result.requestorName &&
        (!result.clientCategory || result.error)
      ) {
        if (typeof window !== "undefined") {
          notFound();
        }
      }
    }
    if (id) checkSubmissionAndFetchName();
  }, [id]);

  if (alreadySubmitted) {
    notFound();
  }

  if (
    !nameLoading &&
    (
      !clientNames ||
      (
        !clientNames.patientName &&
        !clientNames.requestorName &&
        !clientNames.clientCategory
      )
    )
  ) {
    notFound();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const submissionData = {
        ...formData,
        clientId: id as string,
      };

      const result = await addDeliveryCareRequest(submissionData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save preferences');
      }

      toast.success('Preferences saved successfully. This window will close in 5 seconds.', {
        action: {
          label: 'OK',
          onClick: () => window.close(),
        },
      });

      setTimeout(() => {
        window.close();
      }, 5000);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 text-slate-800 py-6'>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {nameLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-slate-800 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">Verifying user</span>
          </div>
        ) : (
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-32 h-12 md:w-80 md:h-20 shrink-0">
                  <Image
                    src={clientNames?.clientCategory === 'DearCare LLP' ? "/dcTransparent.png" : "/TATA.png"}
                    alt={clientNames?.clientCategory === 'DearCare LLP' ? "DearCare Logo" : "Tata Home Nursing Logo"}
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-2xl font-medium bg-gray-50 border border-gray-100
                  ${clientNames?.clientCategory === 'DearCare LLP' ? "text-dCblue" : "text-amber-600"}`}>
                  {clientNames?.clientCategory === 'DearCare LLP' ? 'DearCare' : 'Tata Home Nursing'}
                </div>
              </div>
              <div className="flex flex-col md:items-end">
                <h2 className="text-lg font-semibold text-slate-800">Delivery Care Preferences Form</h2>
              </div>
            </div>

            <div className="bg-slate-50/50 border-b border-gray-100 p-6 md:p-8">
              {clientNames ? (
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="mt-1 hidden md:block">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Verification Required</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      {clientNames.patientName && (
                        <div className="bg-white border border-gray-200 p-3 rounded-md shadow-sm">
                          <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Patient Name</span>
                          <span className="font-medium text-slate-700 text-base">{clientNames.patientName || 'N/A'}</span>
                        </div>
                      )}
                      <div className="bg-white border border-gray-200 p-3 rounded-md shadow-sm">
                        <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Requestor Name</span>
                        <span className="font-medium text-slate-700 text-base">{clientNames.requestorName || 'N/A'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Please confirm the identities above match your records. If these details are incorrect,
                      <span className="font-semibold text-slate-700"> do not proceed</span> with the form and contact support immediately.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-red-600 font-medium text-sm">Unable to verify patient identity. Please contact support.</span>
                </div>
              )}
            </div>

            <div className="p-6 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-10">
                <DeliveryCareForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleDutyChange={handleDutyChange}
                  formErrors={formErrors}
                />
                <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100 mt-12">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        Processing...
                      </span>
                    ) : 'Submit Preferences'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}