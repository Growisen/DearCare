import React, { useState } from 'react';
import { updateClientStatus, savePatientAssessment } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
}

interface UnderReviewContentProps {
  clientId: string;
}

const InputField = ({ label, type = 'text', placeholder, id, value, onChange, required = false }: InputFieldProps) => (
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

export function UnderReviewContent({ clientId }: UnderReviewContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
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
      
      // 1. Save the assessment data first
      const assessmentResult = await savePatientAssessment({
        clientId,
        assessmentData: formattedData
      });
      
      if (!assessmentResult.success) {
        throw new Error(assessmentResult.error || 'Failed to save assessment data');
      }
      
      // 2. Update client status to 'approved'
      const statusResult = await updateClientStatus(clientId, 'approved');
      
      if (!statusResult.success) {
        throw new Error(statusResult.error || 'Failed to update client status');
      }
      
      toast.success('Client approved successfully!');
      
    } catch (error) {
      console.error('Error approving client:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Assesment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guardian&apos;s Occupation
            </label>
            <select 
              id="guardianOccupation"
              value={formData.guardianOccupation}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select occupation</option>
              <option value="GOVT">Government Service</option>
              <option value="BUSINESS">Business</option>
              <option value="PRIVATE">Private Sector</option>
              <option value="ABROAD">Working Abroad</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marital Status
            </label>
            <select 
              id="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select status</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="DIVORCED">Divorced</option>
              <option value="SEPARATED">Separated</option>
              <option value="WIDOWED">Widowed</option>
            </select>
          </div>

          <InputField
            label="Height (cm)"
            type="number"
            placeholder="Enter height"
            id="height"
            value={formData.height}
            onChange={handleInputChange}
          />

          <InputField
            label="Weight (kg)"
            type="number"
            placeholder="Enter weight"
            id="weight"
            value={formData.weight}
            onChange={handleInputChange}
          />

          <InputField
            label="Pincode"
            type="text"
            placeholder="Enter 6-digit pincode"
            id="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
          />

          <InputField
            label="District"
            placeholder="Enter district"
            id="district"
            value={formData.district}
            onChange={handleInputChange}
          />

          <InputField
            label="City/Town"
            placeholder="Enter city/town"
            id="cityTown"
            value={formData.cityTown}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Medical Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Status
            </label>
            <select 
              id="currentStatus"
              value={formData.currentStatus}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select status</option>
              <option value="HOSPITALIZED">Hospitalized</option>
              <option value="HOME">At Home</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chronic Illness
            </label>
            <select 
              id="chronicIllness"
              value={formData.chronicIllness}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select option</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </select>
          </div>

          <div className="col-span-2">
            <InputField
              label="Medical History"
              type="textarea"
              placeholder="Enter detailed medical history"
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-span-2">
            <InputField
              label="Surgical History"
              type="textarea"
              placeholder="Enter surgical history"
              id="surgicalHistory"
              value={formData.surgicalHistory}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-span-2">
            <InputField
              label="Medication History"
              type="textarea"
              placeholder="Enter medication history"
              id="medicationHistory"
              value={formData.medicationHistory}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Psychological Assessment</h3>
        <div className="grid grid-cols-1 gap-6">
          <InputField
            label="Alertness Level"
            placeholder="Describe patient's alertness level"
            id="alertnessLevel"
            value={formData.alertnessLevel}
            onChange={handleInputChange}
          />

          <InputField
            label="Physical Behavior"
            placeholder="Describe gait, posture, coordination, etc."
            id="physicalBehavior"
            value={formData.physicalBehavior}
            onChange={handleInputChange}
          />

          <InputField
            label="Speech Patterns"
            placeholder="Describe speech characteristics"
            id="speechPatterns"
            value={formData.speechPatterns}
            onChange={handleInputChange}
          />

          <InputField
            label="Emotional State"
            placeholder="Describe emotional reactions"
            id="emotionalState"
            value={formData.emotionalState}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social History</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Drugs Use"
            placeholder="Enter details if any"
            id="drugsUse"
            value={formData.drugsUse}
            onChange={handleInputChange}
          />

          <InputField
            label="Alcohol Use"
            placeholder="Enter details if any"
            id="alcoholUse"
            value={formData.alcoholUse}
            onChange={handleInputChange}
          />

          <InputField
            label="Tobacco Use"
            placeholder="Enter details if any"
            id="tobaccoUse"
            value={formData.tobaccoUse}
            onChange={handleInputChange}
          />

          <div className="col-span-3">
            <InputField
              label="Other Social History"
              type="textarea"
              placeholder="Enter any additional social history"
              id="otherSocialHistory"
              value={formData.otherSocialHistory}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <InputField
              label="Present Condition"
              type="textarea"
              placeholder="Describe current condition"
              id="presentCondition"
              value={formData.presentCondition}
              onChange={handleInputChange}
            />
          </div>

          <InputField
            label="Blood Pressure"
            placeholder="Enter BP reading"
            id="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleInputChange}
          />

          <InputField
            label="Sugar Level"
            placeholder="Enter sugar level"
            id="sugarLevel"
            value={formData.sugarLevel}
            onChange={handleInputChange}
          />
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lab Investigations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="HB"
              placeholder="Enter HB value"
              id="hb"
              value={formData.hb}
              onChange={handleInputChange}
            />
            <InputField
              label="RBC"
              placeholder="Enter RBC count"
              id="rbc"
              value={formData.rbc}
              onChange={handleInputChange}
            />
            <InputField
              label="ESR"
              placeholder="Enter ESR value"
              id="esr"
              value={formData.esr}
              onChange={handleInputChange}
            />
            <InputField
              label="Urine Analysis"
              placeholder="Enter urine analysis details"
              id="urine"
              value={formData.urine}
              onChange={handleInputChange}
            />
            <InputField
              label="Sodium"
              placeholder="Enter sodium levels"
              id="sodium"
              value={formData.sodium}
              onChange={handleInputChange}
            />
            <div className="col-span-3">
              <InputField
                label="Other Lab Investigations"
                type="textarea"
                placeholder="Enter any additional lab investigations"
                id="otherLabInvestigations"
                value={formData.otherLabInvestigations}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnosis & Care Plan</h3>
        <div className="grid grid-cols-1 gap-6">
          <InputField
            label="Final Diagnosis"
            type="textarea"
            placeholder="Enter final diagnosis"
            id="finalDiagnosis"
            value={formData.finalDiagnosis}
            onChange={handleInputChange}
          />

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Food Chart</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Foods to Include"
                type="textarea"
                placeholder="List foods to include"
                id="foodsToInclude"
                value={formData.foodsToInclude}
                onChange={handleInputChange}
              />
              <InputField
                label="Foods to Avoid"
                type="textarea"
                placeholder="List foods to avoid"
                id="foodsToAvoid"
                value={formData.foodsToAvoid}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Position
            </label>
            <select 
              id="patientPosition"
              value={formData.patientPosition}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select position</option>
              <option value="NORMAL">Normal</option>
              <option value="USE_PILLOWS">Use Pillows</option>
              <option value="RAISE_HEAD">Raise the Head of the Bed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feeding Method
            </label>
            <select 
              id="feedingMethod"
              value={formData.feedingMethod}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select method</option>
              <option value="ORAL">Oral</option>
              <option value="TUBE">Tube</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Environment & Equipment</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded text-blue-600"
                checked={formData.isClean}
                onChange={(e) => handleCheckboxChange('isClean', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Clean Environment</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded text-blue-600"
                checked={formData.isVentilated}
                onChange={(e) => handleCheckboxChange('isVentilated', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Well Ventilated</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded text-blue-600"
                checked={formData.isDry}
                onChange={(e) => handleCheckboxChange('isDry', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Dry Environment</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded text-blue-600"
                checked={formData.hasNatureView}
                onChange={(e) => handleCheckboxChange('hasNatureView', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Views of Nature</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded text-blue-600"
                checked={formData.hasSocialInteraction}
                onChange={(e) => handleCheckboxChange('hasSocialInteraction', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Social Interaction</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded text-blue-600"
                checked={formData.hasSupportiveEnv}
                onChange={(e) => handleCheckboxChange('hasSupportiveEnv', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Supportive Environment</span>
            </label>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Required Equipment</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'hospitalBed', label: 'Hospital Bed' },
                { id: 'wheelChair', label: 'Wheel Chair' },
                { id: 'adultDiaper', label: 'Adult Diaper' },
                { id: 'disposableUnderpad', label: 'Disposable Underpad' },
                { id: 'pillows', label: 'Pillows' },
                { id: 'bedRidden', label: 'Bed Ridden' },
              ].map((equipment) => (
                <label key={equipment.id} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-600"
                    checked={formData.equipment[equipment.id as keyof typeof formData.equipment]}
                    onChange={(e) => handleEquipmentChange(equipment.id, e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">{equipment.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review Checklist</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Verify medical documents</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Check care requirements</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Assess nurse availability</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">Verify payment details</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
          onClick={handleApprove}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Approve & Assign'}
        </button>
        <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
          Reject
        </button>
      </div>
    </div>
  );
}