import React, { useState, useEffect } from 'react';
import InputField from '@/components/open-form/InputField';
import ProfileImageUpload from '@/components/open-form/ProfileImageUpload';
import { Patient } from '@/types/client.types';
import toast from 'react-hot-toast';
import { updateIndividualClientProfile } from "@/app/actions/clients/client-actions";
import { relationOptions } from "@/utils/constants"
import {
  useNameValidation,
  usePhoneValidation,
  useEmailValidation,
  usePincodeValidation,
  useTextFieldValidation
} from '@/hooks/useValidation';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  patient,
  onSave
}) => {
  const [formData, setFormData] = useState({
    // Patient details
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: '',
    patientAddress: '',
    patientCity: '',
    patientDistrict: '',
    patientState: '',
    patientPincode: '',
    patientProfilePic: null as File | null,
    preferredCaregiverGender: '', // NEW
    
    // Requestor details
    requestorName: '',
    requestorPhone: '',
    requestorEmail: '',
    requestorAddress: '',
    requestorCity: '',
    requestorDistrict: '',
    requestorState: '',
    requestorPincode: '',
    requestorProfilePic: null as File | null,
    relationToPatient: '', // NEW
    requestorEmergencyPhone: '', // NEW
    requestorJobDetails: '', // NEW
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation hooks for requestor fields
  const requestorNameValidation = useNameValidation(formData.requestorName);
  const requestorPhoneValidation = usePhoneValidation(formData.requestorPhone);
  const requestorEmailValidation = useEmailValidation(formData.requestorEmail);
  const requestorPincodeValidation = usePincodeValidation(formData.requestorPincode);
  const requestorCityValidation = useTextFieldValidation(formData.requestorCity, 'City', true);
  const requestorDistrictValidation = useTextFieldValidation(formData.requestorDistrict, 'District', true);
  const requestorStateValidation = useTextFieldValidation(formData.requestorState, 'State', true);

  // Validation hooks for patient fields
  const patientNameValidation = useNameValidation(formData.patientName);
  const patientPhoneValidation = usePhoneValidation(formData.patientPhone);
  const patientPincodeValidation = usePincodeValidation(formData.patientPincode);
  const patientCityValidation = useTextFieldValidation(formData.patientCity, 'City', true);
  const patientDistrictValidation = useTextFieldValidation(formData.patientDistrict, 'District', true);
  const patientStateValidation = useTextFieldValidation(formData.patientState, 'State', true);

  // Initialize form with patient data when modal opens
  useEffect(() => {
    if (patient && isOpen) {
      setFormData({
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientPhone: patient.phoneNumber || '',
        patientAge: patient.age?.toString() || '',
        patientGender: patient.gender || '',
        patientAddress: patient.address?.fullAddress || '',
        patientCity: patient.address?.city || '',
        patientDistrict: patient.address?.district || '',
        patientState: patient.address?.state || '',
        patientPincode: patient.address?.pincode || '',
        patientProfilePic: null,
        preferredCaregiverGender: patient.serviceDetails.preferredCaregiverGender || '', // NEW
        
        requestorName: patient.requestor?.name || '',
        requestorPhone: patient.requestor?.phone || '',
        requestorEmail: patient.requestor?.email || '',
        requestorAddress: patient.requestor?.address?.fullAddress || '',
        requestorCity: patient.requestor?.address?.city || '',
        requestorDistrict: patient.requestor?.address?.district || '',
        requestorState: patient.requestor?.address?.state || '',
        requestorPincode: patient.requestor?.address?.pincode || '',
        requestorProfilePic: null,
        relationToPatient: patient.requestor?.relation || '', // NEW
        requestorEmergencyPhone: patient.requestor?.emergencyPhone || '', // NEW
        requestorJobDetails: patient.requestor?.jobDetails || '', // NEW
      });
    }
  }, [patient, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear error for this field when user changes it
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleProfileImageChange = (field: 'requestorProfilePic' | 'patientProfilePic', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  // Sync validation hooks with formData on change
  useEffect(() => {
    requestorNameValidation.setName(formData.requestorName);
    requestorPhoneValidation.setPhone(formData.requestorPhone);
    requestorEmailValidation.setEmail(formData.requestorEmail);
    requestorPincodeValidation.setPincode(formData.requestorPincode);
    requestorCityValidation.setValue(formData.requestorCity);
    requestorDistrictValidation.setValue(formData.requestorDistrict);
    requestorStateValidation.setValue(formData.requestorState);

    patientNameValidation.setName(formData.patientName);
    patientPhoneValidation.setPhone(formData.patientPhone);
    patientPincodeValidation.setPincode(formData.patientPincode);
    patientCityValidation.setValue(formData.patientCity);
    patientDistrictValidation.setValue(formData.patientDistrict);
    patientStateValidation.setValue(formData.patientState);
  }, [
    formData.requestorName, formData.requestorPhone, formData.requestorEmail, formData.requestorPincode,
    formData.requestorCity, formData.requestorDistrict, formData.requestorState,
    formData.patientName, formData.patientPhone, formData.patientPincode,
    formData.patientCity, formData.patientDistrict, formData.patientState,
    patientCityValidation, patientDistrictValidation, patientNameValidation, 
    patientPhoneValidation, patientPincodeValidation, patientStateValidation,
    requestorCityValidation, requestorDistrictValidation, requestorEmailValidation, 
    requestorNameValidation, requestorPhoneValidation, requestorPincodeValidation, 
    requestorStateValidation
  ]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Patient validations (all optional, so skip required checks)
    if (formData.patientName && patientNameValidation.validateName(formData.patientName))
      errors.patientName = patientNameValidation.validateName(formData.patientName);
    if (formData.patientPhone && patientPhoneValidation.validatePhone(formData.patientPhone))
      errors.patientPhone = patientPhoneValidation.validatePhone(formData.patientPhone);
    if (formData.patientPincode && patientPincodeValidation.validatePincode(formData.patientPincode))
      errors.patientPincode = patientPincodeValidation.validatePincode(formData.patientPincode);
    if (formData.patientCity && patientCityValidation.validateTextField(formData.patientCity))
      errors.patientCity = patientCityValidation.validateTextField(formData.patientCity);
    if (formData.patientDistrict && patientDistrictValidation.validateTextField(formData.patientDistrict))
      errors.patientDistrict = patientDistrictValidation.validateTextField(formData.patientDistrict);
    if (formData.patientState && patientStateValidation.validateTextField(formData.patientState))
      errors.patientState = patientStateValidation.validateTextField(formData.patientState);
    // patientAge and patientGender are optional, so no required check

    // Requestor validations (still required)
    if (requestorNameValidation.validateName(formData.requestorName))
      errors.requestorName = requestorNameValidation.validateName(formData.requestorName);
    if (requestorPhoneValidation.validatePhone(formData.requestorPhone))
      errors.requestorPhone = requestorPhoneValidation.validatePhone(formData.requestorPhone);
    if (requestorEmailValidation.validateEmail(formData.requestorEmail))
      errors.requestorEmail = requestorEmailValidation.validateEmail(formData.requestorEmail);
    if (requestorPincodeValidation.validatePincode(formData.requestorPincode))
      errors.requestorPincode = requestorPincodeValidation.validatePincode(formData.requestorPincode);
    if (requestorCityValidation.validateTextField(formData.requestorCity))
      errors.requestorCity = requestorCityValidation.validateTextField(formData.requestorCity);
    if (requestorDistrictValidation.validateTextField(formData.requestorDistrict))
      errors.requestorDistrict = requestorDistrictValidation.validateTextField(formData.requestorDistrict);
    if (requestorStateValidation.validateTextField(formData.requestorState))
      errors.requestorState = requestorStateValidation.validateTextField(formData.requestorState);

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !patient?._id) return;
    
    setIsSubmitting(true);
    try {
      // Split patient name into first and last name
      const nameParts = formData.patientName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      const profileData = {
        patientFirstName: firstName,
        patientLastName: lastName,
        patientPhone: formData.patientPhone,
        patientAge: formData.patientAge,
        patientGender: formData.patientGender,
        patientAddress: formData.patientAddress,
        patientCity: formData.patientCity,
        patientDistrict: formData.patientDistrict,
        patientState: formData.patientState,
        patientPincode: formData.patientPincode,
        patientProfilePic: formData.patientProfilePic,
        preferredCaregiverGender: formData.preferredCaregiverGender, // NEW

        requestorName: formData.requestorName,
        requestorPhone: formData.requestorPhone,
        requestorEmail: formData.requestorEmail,
        requestorAddress: formData.requestorAddress,
        requestorCity: formData.requestorCity,
        requestorDistrict: formData.requestorDistrict,
        requestorState: formData.requestorState,
        requestorPincode: formData.requestorPincode,
        requestorProfilePic: formData.requestorProfilePic,
        relationToPatient: formData.relationToPatient, // NEW
        requestorEmergencyPhone: formData.requestorEmergencyPhone, // NEW
        requestorJobDetails: formData.requestorJobDetails, // NEW
      };
      
      const result = await updateIndividualClientProfile(patient._id, profileData);
      
      if (result.success) {
        toast.success('Profile updated successfully');
        onSave();
        onClose();
      } else {
        toast.error(`Failed to update profile: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating the profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = (id: string) => {
    // Validate field on blur using hooks
    let error = '';
    switch (id) {
      // Patient fields: only validate if not empty
      case 'patientName':
        if (formData.patientName)
          error = patientNameValidation.validateName(formData.patientName);
        break;
      case 'patientPhone':
        if (formData.patientPhone)
          error = patientPhoneValidation.validatePhone(formData.patientPhone);
        break;
      case 'patientPincode':
        if (formData.patientPincode)
          error = patientPincodeValidation.validatePincode(formData.patientPincode);
        break;
      case 'patientCity':
        if (formData.patientCity)
          error = patientCityValidation.validateTextField(formData.patientCity);
        break;
      case 'patientDistrict':
        if (formData.patientDistrict)
          error = patientDistrictValidation.validateTextField(formData.patientDistrict);
        break;
      case 'patientState':
        if (formData.patientState)
          error = patientStateValidation.validateTextField(formData.patientState);
        break;
      // Requestor fields: always required
      case 'requestorName':
        error = requestorNameValidation.validateName(formData.requestorName);
        break;
      case 'requestorPhone':
        error = requestorPhoneValidation.validatePhone(formData.requestorPhone);
        break;
      case 'requestorEmail':
        error = requestorEmailValidation.validateEmail(formData.requestorEmail);
        break;
      case 'requestorPincode':
        error = requestorPincodeValidation.validatePincode(formData.requestorPincode);
        break;
      case 'requestorCity':
        error = requestorCityValidation.validateTextField(formData.requestorCity);
        break;
      case 'requestorDistrict':
        error = requestorDistrictValidation.validateTextField(formData.requestorDistrict);
        break;
      case 'requestorState':
        error = requestorStateValidation.validateTextField(formData.requestorState);
        break;
      default:
        // Only requestor fields are required
        if (
          id.startsWith('requestor') &&
          typeof formData[id as keyof typeof formData] === 'string' &&
          !(formData[id as keyof typeof formData] as string).trim()
        ) {
          error = `${id} is required`;
        }
    }
    if (error) {
      setFormErrors(prev => ({ ...prev, [id]: error }));
    } else {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 sm:p-0">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-semibold text-gray-800">Edit Profile Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requestor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="Requestor Full Name" 
                  placeholder="Enter requestor's name" 
                  id="requestorName" 
                  value={formData.requestorName} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorName')}
                  error={formErrors.requestorName || requestorNameValidation.nameError}
                />
                <InputField 
                  label="Requestor Phone Number" 
                  type="tel" 
                  placeholder="Enter requestor's phone number" 
                  id="requestorPhone" 
                  value={formData.requestorPhone} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorPhone')}
                  error={formErrors.requestorPhone || requestorPhoneValidation.phoneError}
                />
                <InputField 
                  label="Requestor Email Address" 
                  type="email" 
                  placeholder="Enter requestor's email address" 
                  id="requestorEmail" 
                  value={formData.requestorEmail} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorEmail')}
                  error={formErrors.requestorEmail || requestorEmailValidation.emailError}
                />
                
                {/* Requestor Address Fields */}
                <InputField 
                  label="Requestor Address"
                  placeholder="Enter requestor's address" 
                  id="requestorAddress" 
                  value={formData.requestorAddress} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorAddress')}
                  error={formErrors.requestorAddress}
                />
                <InputField 
                  label="Requestor City" 
                  placeholder="Enter requestor's city" 
                  id="requestorCity" 
                  value={formData.requestorCity} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorCity')}
                  error={formErrors.requestorCity || requestorCityValidation.error}
                />
                <InputField 
                  label="Requestor District" 
                  placeholder="Enter requestor's district" 
                  id="requestorDistrict" 
                  value={formData.requestorDistrict} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorDistrict')}
                  error={formErrors.requestorDistrict || requestorDistrictValidation.error}
                />
                <InputField 
                  label="Requestor State" 
                  placeholder="Enter requestor's state" 
                  id="requestorState" 
                  value={formData.requestorState} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorState')}
                  error={formErrors.requestorState || requestorStateValidation.error}
                />
                <InputField 
                  label="Requestor Pincode" 
                  placeholder="Enter requestor's pincode" 
                  id="requestorPincode" 
                  value={formData.requestorPincode} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorPincode')}
                  error={formErrors.requestorPincode || requestorPincodeValidation.pincodeError}
                />
                
                {/* Relation to Patient (select) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="relationToPatient">
                    Relation to Patient
                  </label>
                  <select
                    id="relationToPatient"
                    value={formData.relationToPatient}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {relationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <InputField 
                  label="Emergency Phone"
                  placeholder="Enter emergency phone"
                  id="requestorEmergencyPhone"
                  value={formData.requestorEmergencyPhone}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorEmergencyPhone')}
                  error={formErrors.requestorEmergencyPhone}
                />
                <InputField 
                  label="Job Details"
                  placeholder="Enter job details"
                  id="requestorJobDetails"
                  value={formData.requestorJobDetails}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('requestorJobDetails')}
                  error={formErrors.requestorJobDetails}
                />
                
                <div className="md:col-span-2">
                  <ProfileImageUpload
                    id="requestorProfilePic"
                    label="Requestor's Profile Picture"
                    value={formData.requestorProfilePic}
                    onChange={(file) => handleProfileImageChange('requestorProfilePic', file)}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                  label="Patient's Full Name" 
                  placeholder="Enter patient's name" 
                  id="patientName" 
                  value={formData.patientName} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('patientName')}
                  error={formErrors.patientName || patientNameValidation.nameError}
                />
                <InputField 
                  label="Patient's Age" 
                  type="number" 
                  placeholder="Enter patient's age" 
                  id="patientAge" 
                  value={formData.patientAge} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('patientAge')}
                  error={formErrors.patientAge}
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patientGender">
                    Patient&apos;s Gender
                  </label>
                  <select 
                    id="patientGender" 
                    value={formData.patientGender} 
                    onChange={handleInputChange} 
                    onBlur={() => handleBlur('patientGender')}
                    className={`w-full border ${formErrors.patientGender ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {formErrors.patientGender && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.patientGender}</p>
                  )}
                </div>
                {/* Preferred Caregiver Gender (select) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="preferredCaregiverGender">
                    Preferred Caregiver Gender
                  </label>
                  <select
                    id="preferredCaregiverGender"
                    value={formData.preferredCaregiverGender}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select caregiver gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="any">Any</option>
                  </select>
                </div>
                <InputField 
                  label="Patient's Phone Number" 
                  type="tel" 
                  placeholder="Enter patient's phone number" 
                  id="patientPhone" 
                  value={formData.patientPhone} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('patientPhone')}
                  error={formErrors.patientPhone || patientPhoneValidation.phoneError}
                />
                
                {/* Patient Address Fields */}
                <InputField 
                  label="Patient's Address"
                  placeholder="Enter patient's address" 
                  id="patientAddress" 
                  value={formData.patientAddress} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('patientAddress')}
                  error={formErrors.patientAddress}
                />
                <InputField 
                  label="Patient's City" 
                  placeholder="Enter patient's city" 
                  id="patientCity" 
                  value={formData.patientCity} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('patientCity')}
                  error={formErrors.patientCity || patientCityValidation.error}
                />
                <InputField 
                  label="Patient's District" 
                  placeholder="Enter patient's district" 
                  id="patientDistrict" 
                  value={formData.patientDistrict} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('patientDistrict')}
                  error={formErrors.patientDistrict || patientDistrictValidation.error}
                />
                <InputField 
                  label="Patient's State" 
                  placeholder="Enter patient's state" 
                  id="patientState" 
                  value={formData.patientState} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('patientState')}
                  error={formErrors.patientState || patientStateValidation.error}
                />
                <InputField 
                  label="Patient's Pincode" 
                  placeholder="Enter patient's pincode" 
                  id="patientPincode" 
                  value={formData.patientPincode} 
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('patientPincode')}
                  error={formErrors.patientPincode || patientPincodeValidation.pincodeError}
                />
                
                <div className="md:col-span-2">
                  <ProfileImageUpload
                    id="patientProfilePic"
                    label="Patient's Profile Picture"
                    value={formData.patientProfilePic}
                    onChange={(file) => handleProfileImageChange('patientProfilePic', file)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer - Sticky at bottom */}
          <div className="sticky bottom-0 flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;