"use client"

import React, { useEffect, useState } from 'react';
import { useReassessmentForm } from '@/hooks/useReassessment';
import DiagnosisSection from './DiagnosisSection';
import VitalsSection from './VitalsSection';
import BedSoreSection from './BedSoreSection';
import PatientStatusSection from './PatientStatusSection';
import AdminSection from './AdminSection';
import { getClientNames } from '@/app/actions/clients/assessment';
import { Save } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ReassessmentForm({ clientId }: { clientId: string }) {
  const {
    formData,
    handleInputChange,
    handleVitalChange,
    handleBedSoreChange,
    setBedSoreStage,
    addDynamicField,
    removeDynamicField,
    updateDynamicField,
    handleSubmit,
    loading,
    error
  } = useReassessmentForm(clientId);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!loading && submitted) {
      if (error) {
        toast.error(error || "Failed to save reassessment");
      } else {
        toast.success('Reassessment saved successfully. This window will close in 5 seconds.', {
          action: {
            label: 'OK',
            onClick: () => window.close()
          }
        });

        setTimeout(() => {
          window.close();
        }, 5000);
      }
      setSubmitted(false);
    }
  }, [loading, error, submitted]);

  const onSubmit = (e: React.FormEvent) => {
    setSubmitted(true);
    handleSubmit(e);
  };

  const dynamicProps = {
    onAdd: addDynamicField,
    onRemove: removeDynamicField,
    onUpdate: updateDynamicField
  };

  const [clientInfo, setClientInfo] = useState<{
    requestorName?: string;
    patientName?: string;
    clientCategory?: string;
    loading: boolean;
    error?: string;
  }>({ loading: true });

  useEffect(() => {
    let isMounted = true;
    if (clientId) {
      setClientInfo({ loading: true });
      getClientNames(clientId).then(res => {
        if (isMounted) {
          setClientInfo({
            requestorName: res.requestorName,
            patientName: res.patientName,
            clientCategory: res.clientCategory,
            loading: false,
            error: res.error
          });
        }
      });
    }
    return () => { isMounted = false; };
  }, [clientId]);

  if (clientInfo.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-slate-800 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">Verifying user</span>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-sm border border-gray-200 rounded-sm">
        <div className="bg-white px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-32 h-12 md:w-80 md:h-20 shrink-0">
              <Image
                src={clientInfo.clientCategory === 'DearCare LLP' ? "/dcTransparent.png" : "/TATA.png"}
                alt={clientInfo.clientCategory === 'DearCare LLP' ? "DearCare Logo" : "Tata Home Nursing Logo"}
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-2xl font-medium bg-gray-50 border border-gray-100
              ${clientInfo.clientCategory === 'DearCare LLP' ? "text-dCblue" : clientInfo.clientCategory === 'Tata Home Nursing' ? 
              "text-amber-600" : 'text-gray-800'}`}>
              {clientInfo.clientCategory === 'DearCare LLP' ? 'DearCare' : clientInfo.clientCategory === 'Tata Home Nursing' ? 'Tata Home Nursing' : '-'}
            </div>
          </div>
          <div className="flex flex-col md:items-end">
            <h2 className="text-lg font-semibold text-slate-800">Reassessment Form</h2>
          </div>
        </div>

        <div className="bg-slate-50/50 border-b border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="mt-1 hidden md:block">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Verification Required</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                {clientInfo.patientName && (
                  <div className="bg-white border border-gray-200 p-3 rounded-md shadow-sm">
                    <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Patient Name</span>
                    <span className="font-medium text-slate-700 text-base">{clientInfo.patientName || 'N/A'}</span>
                  </div>
                )}
                <div className="bg-white border border-gray-200 p-3 rounded-md shadow-sm">
                  <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Requestor Name</span>
                  <span className="font-medium text-slate-700 text-base">{clientInfo.requestorName || 'N/A'}</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Please confirm the identities above match your records. If these details are incorrect, 
                <span className="font-semibold text-slate-700"> do not proceed</span> with the reassessment and contact support immediately.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="p-8 space-y-10">
          <DiagnosisSection 
            formData={formData} 
            onChange={handleInputChange} 
            dynamicProps={dynamicProps} 
          />

          <VitalsSection 
            formData={formData} 
            onChange={handleVitalChange} 
            dynamicProps={dynamicProps} 
          />

          <BedSoreSection 
            formData={formData} 
            onChange={handleBedSoreChange} 
            onStageChange={setBedSoreStage} 
            dynamicProps={dynamicProps} 
          />

          <PatientStatusSection 
            formData={formData} 
            onChange={handleInputChange} 
            dynamicProps={dynamicProps} 
          />

          <AdminSection 
            formData={formData} 
            onChange={handleInputChange} 
            dynamicProps={dynamicProps} 
          />

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className={`flex items-center gap-2 bg-gray-900 text-white px-8 py-2.5 rounded-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all text-sm font-medium ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}