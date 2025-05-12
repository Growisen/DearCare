import React, { useState, useEffect } from 'react';
import { updateClientStatus, savePatientAssessment, sendClientAssessmentFormLink, getClientAssessmentFormStatus } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import PersonalInfo from './UnderReview/PersonalInfo';
import MedicalStatus from './UnderReview/MedicalStatus';
import PsychologicalAssessment from './UnderReview/PsychologicalAssessment';
import SocialHistory from './UnderReview/SocialHistory';
import CurrentDetails from './UnderReview/CurrentHistory';
import DiagnosisAndCarePlan from './UnderReview/DiagnosisAndCarePlan';
import EnvironmentAndEquipment from './UnderReview/EnvironmentAndEquipment';
import ReviewChecklist from './UnderReview/ReviewChecklist';
import RejectModal from './RejectModal';
import { v4 as uuidv4 } from 'uuid';
import { FamilyMember } from '@/types/client.types';
import FamilyMembers from '@/components/client/UnderReview/FamilyMembers';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
}

interface UnderReviewContentProps {
  clientId: string;
  clientType: string | undefined;
  onClose?: () => void;
  onStatusChange?: (newStatus?: "pending" | "under_review" | "approved" | "rejected" | "assigned") => void;
}

export const InputField = ({ label, type = 'text', placeholder, id, value, onChange, required = false }: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={4}
      />
    ) : (
      <input
        type={type}
        id={id}
        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    )}
  </div>
);

export function UnderReviewContent({ clientId, clientType, onClose, onStatusChange }: UnderReviewContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSendingForm, setIsSendingForm] = useState(false);
  const [formStatus, setFormStatus] = useState({
    isChecking: false,
    isFormFilled: false,
  });
  
  const [formData, setFormData] = useState({
    // All form fields remain unchanged
    guardianOccupation: '',
    maritalStatus: '',
    height: '',
    weight: '',
    pincode: '',
    district: '',
    cityTown: '',
    currentStatus: '',
    chronicIllness: '',
    medicalHistory: '',
    surgicalHistory: '',
    medicationHistory: '',
    alertnessLevel: '',
    physicalBehavior: '',
    speechPatterns: '',
    emotionalState: '',
    drugsUse: '',
    alcoholUse: '',
    tobaccoUse: '',
    otherSocialHistory: '',
    presentCondition: '',
    bloodPressure: '',
    sugarLevel: '',
    hb: '',
    rbc: '',
    esr: '',
    urine: '',
    sodium: '',
    otherLabInvestigations: '',
    finalDiagnosis: '',
    foodsToInclude: '',
    foodsToAvoid: '',
    patientPosition: '',
    feedingMethod: '',
    isClean: false,
    isVentilated: false,
    isDry: false,
    hasNatureView: false,
    hasSocialInteraction: false,
    hasSupportiveEnv: false,
    equipment: {
      hospitalBed: false,
      wheelChair: false,
      adultDiaper: false,
      disposableUnderpad: false,
      pillows: false,
      bedRidden: false,
      semiBedridden: false,
      bedWedges: false,
      bedsideCommode: false,
      patientLift: false,
      bedsideHandRail: false,
      examinationGloves: false,
      noRinseCleanser: false,
      bathingWipes: false,
      bpMeasuringApparatus: false,
      electricBackLifter: false,
      o2Concentrator: false,
      overBedTable: false,
      suctionMachine: false,
      ivStand: false,
      bedPan: false,
      decubitusMatress: false,
      airMatress: false,
      bpMonitor: false,
      bedLift: false,
      bedRail: false,
      cane: false,
      walkers: false,
      crutches: false,
    },

    familyMembers: [] as FamilyMember[],
  });

  const [sharableLink, setSharableLink] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipmentId]: checked
      }
    }));
  };

  const handleAddFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        {
          id: uuidv4(),
          name: '',
          age: '',
          job: '',
          relation: '',
          medicalRecords: ''
        }
      ]
    }));
  };

  const handleRemoveFamilyMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(member => member.id !== id)
    }));
  };

  const handleFamilyMemberChange = (id: string, field: keyof FamilyMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);

      if (clientType === "individual") {
        const formattedData = {
          ...formData,
          lab_investigations: {
            hb: formData.hb,
            rbc: formData.rbc,
            esr: formData.esr,
            urine: formData.urine,
            sodium: formData.sodium,
            other: formData.otherLabInvestigations
          },
          environment: {
            isClean: formData.isClean,
            isVentilated: formData.isVentilated,
            isDry: formData.isDry,
            hasNatureView: formData.hasNatureView,
            hasSocialInteraction: formData.hasSocialInteraction,
            hasSupportiveEnv: formData.hasSupportiveEnv
          }
        };
        
        const assessmentResult = await savePatientAssessment({
          clientId,
          assessmentData: formattedData
        });
        
        if (!assessmentResult.success) {
          throw new Error(assessmentResult.error || 'Failed to save assessment data');
        }
      }
      
      const statusResult = await updateClientStatus(clientId, 'approved');
      
      if (!statusResult.success) {
        throw new Error(statusResult.error || 'Failed to update client status');
      }
      
      toast.success('Client approved successfully!');

      if (onStatusChange) {
        onStatusChange('approved');
      }

      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Error approving client:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleReject = async () => {
    try {
      if (!rejectionReason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }
      
      setIsSubmitting(true);
      
      // Update client status to 'rejected' with the rejection reason
       const result = await updateClientStatus(clientId, 'rejected', rejectionReason);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject client');
      }
      
      toast.success('Client rejected successfully');
      
      // Call the onStatusChange callback to refresh the client list
      if (onStatusChange) {
        onStatusChange('rejected');
      }
      
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Error rejecting client:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
      setShowRejectModal(false);
    }
  };

  const handleSendFormToUser = async () => {
    try {
      setIsSendingForm(true);
      
      const result = await sendClientAssessmentFormLink(clientId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send form');
      }
      
      toast.success('Assessment form sent to client successfully!');
    } catch (error) {
      console.error('Error sending form to client:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send form');
    } finally {
      setIsSendingForm(false);
    }
  };

  const checkFormStatus = async () => {
    try {
      setFormStatus(prev => ({ ...prev, isChecking: true }));
      
      const result = await getClientAssessmentFormStatus(clientId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to check form status');
      }
      
      setFormStatus({
        isChecking: false,
        isFormFilled: result.isFormFilled,
      });
      
      if (result.isFormFilled) {
        console.log('Client has filled the assessment form');
      }
    } catch (error) {
      console.error('Error checking form status:', error);
      console.error(error instanceof Error ? error.message : 'Failed to check form status');
      setFormStatus(prev => ({ ...prev, isChecking: false }));
    }
  };

  const generateSharableLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/patient-assessment/${clientId}`;
    setSharableLink(link);
    setShowLinkModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sharableLink);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
      console.error('Failed to copy:', err);
    }
  };

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Please fill out this assessment form: ${sharableLink}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    if (clientType === "individual") {
      checkFormStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, clientType]);
  

  return (
    <div className="space-y-6">
      {clientType === "individual" ? (
        // Content for individual clients
        <>
          {!showForm ? (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg">
              
              {formStatus.isFormFilled ? (
              <div className="w-full max-w-md">
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">Client has filled the assessment form</p>
                </div>

                <button 
                  className="w-full px-6 py-3 mb-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Link 
                    href={`/client-profile/${clientId}`} 
                    target='_blank'
                    
                  >
                    View Client Profile
                  </Link>
                </button>
                
                
                {/* Add approve/reject buttons directly on this screen */}
                <div className="flex w-full gap-4">
                  <button 
                    className="w-3/5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
                    onClick={handleApprove}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Approve & Assign'}
                  </button>
                  <button 
                    className="w-2/5 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    onClick={() => setShowRejectModal(true)}
                    disabled={isSubmitting}
                  >
                    Reject
                  </button>
                </div>
              </div>
              ) : (
                // When form is not filled, show the regular options
                <div className="w-full max-w-md">
                  <p className="text-lg text-gray-700 mb-6">Please select how you would like to proceed with the client assessment</p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full mb-4">
                    <button 
                      onClick={() => setShowForm(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 disabled:bg-blue-400"
                      disabled={isSendingForm || formStatus.isChecking}
                    >
                      Fill Form Manually
                    </button>
                    
                    <button 
                      onClick={handleSendFormToUser}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 disabled:bg-green-400"
                      disabled={isSendingForm || formStatus.isChecking}
                    >
                      {isSendingForm ? 'Sending...' : 'Send Form to User'}
                    </button>
                  </div>
                  
                  {/* New sharable link button */}
                  <button 
                    onClick={generateSharableLink}
                    className="w-full mb-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center"
                    disabled={isSendingForm || formStatus.isChecking}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    Generate Sharable Link
                  </button>
                  
                  <button 
                    onClick={checkFormStatus}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                    disabled={formStatus.isChecking}
                  >
                    {formStatus.isChecking ? 'Checking whether form is filled...' : 'Not filled, check if form is filled'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Back button and form components */}
              <div className="mb-4">
                <button 
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  ← Back
                </button>
              </div>
              
              <PersonalInfo formData={formData} handleInputChange={handleInputChange} />
              <MedicalStatus formData={formData} handleInputChange={handleInputChange} />
              <PsychologicalAssessment formData={formData} handleInputChange={handleInputChange} />
              <SocialHistory formData={formData} handleInputChange={handleInputChange} />
              <CurrentDetails formData={formData} handleInputChange={handleInputChange} />
              <DiagnosisAndCarePlan formData={formData} handleInputChange={handleInputChange} />
              
              <FamilyMembers 
                familyMembers={formData.familyMembers}
                onAddFamilyMember={handleAddFamilyMember}
                onRemoveFamilyMember={handleRemoveFamilyMember}
                onFamilyMemberChange={handleFamilyMemberChange}
              />
              
              <EnvironmentAndEquipment 
                formData={formData} 
                handleCheckboxChange={handleCheckboxChange}
                handleEquipmentChange={handleEquipmentChange}
              />
              <ReviewChecklist />
              
              <div className="flex w-full gap-4">
                <button 
                  className="w-3/5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Approve & Assign'}
                </button>
                <button 
                  className="w-2/5 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  onClick={() => setShowRejectModal(true)}
                  disabled={isSubmitting}
                >
                  Reject
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        // Content for non-individual clients
        <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg">
          
          <div className="flex w-full gap-4 max-w-md mx-auto">
            <button 
              className="w-3/5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Approve & Assign'}
            </button>
            <button 
              className="w-2/5 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              onClick={() => setShowRejectModal(true)}
              disabled={isSubmitting}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      <RejectModal 
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        onReject={handleReject}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        isSubmitting={isSubmitting}
      />

      {/* New sharable link modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 text-gray-950">Sharable Assessment Form Link</h3>
            
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={sharableLink}
                  readOnly
                  className="w-full border border-gray-300 rounded-l-md py-2 px-3 text-gray-700 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy Link
              </button>
              <button
                onClick={shareViaWhatsApp}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
                Share via WhatsApp
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}