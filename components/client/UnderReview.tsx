import React, { useState } from 'react';
import { updateClientStatus, savePatientAssessment, sendClientAssessmentFormLink } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';
import PersonalInfo from './UnderReview/PersonalInfo';
import MedicalStatus from './UnderReview/MedicalStatus';
import PsychologicalAssessment from './UnderReview/PsychologicalAssessment';
import SocialHistory from './UnderReview/SocialHistory';
import CurrentDetails from './UnderReview/CurrentHistory';
import DiagnosisAndCarePlan from './UnderReview/DiagnosisAndCarePlan';
import EnvironmentAndEquipment from './UnderReview/EnvironmentAndEquipment';
import ReviewChecklist from './UnderReview/ReviewChecklist';
import RejectModal from './RejectModal';


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
    },
  });

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
  

  return (
    <div className="space-y-6">
      {clientType === "individual" ? (
        // Content for individual clients
        <>
          {!showForm ? (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-700 mb-6">Please select how you would like to proceed with the client assessment</p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button 
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                >
                  Fill Form Manually
                </button>
                
                <button 
                  onClick={handleSendFormToUser}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 disabled:bg-green-400"
                  disabled={isSendingForm}
                >
                  {isSendingForm ? 'Sending...' : 'Send Form to User'}
                </button>
              </div>
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
    </div>
  );
}