"use client"

import React, { useEffect, useState } from 'react';
import { useReassessmentForm } from '@/hooks/useReassessment';
import DiagnosisSection from './DiagnosisSection';
import VitalsSection from './VitalsSection';
import BedSoreSection from './BedSoreSection';
import PatientStatusSection from './PatientStatusSection';
import AdminSection from './AdminSection';
import { getClientNames } from '@/app/actions/clients/assessment';
import { AlertTriangle, User, Building2, FileText, Save } from 'lucide-react';
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
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-gray-700 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span className="text-gray-700 font-medium text-lg">Loading information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-sm border border-gray-200 rounded-sm">
        <div className="bg-white border-b border-gray-200 shadow-sm">
					<div className="bg-amber-50 border-l-4 border-amber-500 p-4">
						<div className="flex items-center">
							<AlertTriangle className="h-5 w-5 text-amber-600 mr-3" />
							<div>
								<p className="text-sm font-bold text-amber-800">Important Notice</p>
								<p className="text-sm text-amber-700">
									Please verify the details below. If this is not your data/form, <span className="font-bold underline">do not fill it out.</span>
								</p>
							</div>
						</div>
					</div>

					<div className="px-8 py-6">
						<div className="flex items-start justify-between mb-6">
							<div>
								<h1 className="text-2xl font-bold tracking-tight text-gray-900">Reassessment Form</h1>
							</div>
							
							{clientId && !clientInfo.loading && !clientInfo.error && (
								<div className="relative w-48 h-20 opacity-90 hover:opacity-100 transition-opacity">
									<Image
										src={clientInfo.clientCategory === 'DearCare LLP' ? "/dcTransparent.png" : "/TATA.png"}
										alt={clientInfo.clientCategory === 'DearCare LLP' ? "DearCare Logo" : "Tata Home Nursing Logo"}
										fill
										className="object-contain object-right"
									/>
								</div>
							)}
						</div>

						{clientId && (
							<div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
								{clientInfo.loading ? (
									<div className="animate-pulse flex space-x-4">
										<div className="h-4 bg-gray-200 rounded w-1/4"></div>
										<div className="h-4 bg-gray-200 rounded w-1/4"></div>
									</div>
								) : clientInfo.error ? (
									<div className="text-red-500 text-sm flex items-center gap-2">
										<AlertTriangle className="w-4 h-4" />
										Error loading client data: {clientInfo.error}
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
												<User className="w-4 h-4 text-blue-600" />
											</div>
											<div>
												<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Requestor</p>
												<p className="text-sm font-semibold text-gray-900">{clientInfo.requestorName || '-'}</p>
											</div>
										</div>

										{clientInfo.patientName && (
											<div className="flex items-center gap-3">
												<div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
													<FileText className="w-4 h-4 text-emerald-600" />
												</div>
												<div>
													<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patient Name</p>
													<p className="text-sm font-semibold text-gray-900">{clientInfo.patientName || '-'}</p>
												</div>
											</div>
										)}

										<div className="flex items-center gap-3">
											<div className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
												<Building2 className="w-4 h-4 text-purple-600" />
											</div>
											<div>
												<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Organisation</p>
												<span className={`inline-flex items-center px-4 py-1 rounded text-base font-medium bg-gray-100 
                          ${clientInfo.clientCategory === 'DearCare LLP' ? "text-dCblue" : clientInfo.clientCategory === 'Tata Home Nursing' ? 
                          "text-amber-600" : 'text-gray-800'}`}>
														{clientInfo.clientCategory === 'DearCare LLP' ? "DearCare" : clientInfo.clientCategory === 'Tata Home Nursing' ? "Tata Home Nursing" : '-'}
												</span>
											</div>
										</div>
									</div>
								)}
							</div>
						)}
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