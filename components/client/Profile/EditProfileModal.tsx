import React, { useState, useEffect } from 'react';
import ProfileImageUpload from '@/components/open-form/ProfileImageUpload';
import { Patient } from '@/types/client.types';
import { toast } from 'sonner'
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
    preferredCaregiverGender: '',
    
    requestorName: '',
    requestorPhone: '',
    requestorEmail: '',
    requestorAddress: '',
    requestorCity: '',
    requestorDistrict: '',
    requestorState: '',
    requestorPincode: '',
    requestorProfilePic: null as File | null,
    relationToPatient: '',
    requestorEmergencyPhone: '',
    requestorJobDetails: '',

    patientDOB: '',
    requestorDOB: '',
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestorNameValidation = useNameValidation(formData.requestorName);
  const requestorPhoneValidation = usePhoneValidation(formData.requestorPhone);
  const requestorEmailValidation = useEmailValidation(formData.requestorEmail);
  const requestorPincodeValidation = usePincodeValidation(formData.requestorPincode);
  const requestorCityValidation = useTextFieldValidation(formData.requestorCity, 'City', true);
  const requestorDistrictValidation = useTextFieldValidation(formData.requestorDistrict, 'District', true);
  const requestorStateValidation = useTextFieldValidation(formData.requestorState, 'State', true);

  const patientNameValidation = useNameValidation(formData.patientName, false); 
  const patientPhoneValidation = usePhoneValidation(formData.patientPhone, false); 
  const patientPincodeValidation = usePincodeValidation(formData.patientPincode, false);

  const patientCityValidation = useTextFieldValidation(formData.patientCity, 'City', false);
  const patientDistrictValidation = useTextFieldValidation(formData.patientDistrict, 'District', false);
  const patientStateValidation = useTextFieldValidation(formData.patientState, 'State', false);

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
        preferredCaregiverGender: patient.serviceDetails.preferredCaregiverGender || '',
        
        requestorName: patient.requestor?.name || '',
        requestorPhone: patient.requestor?.phone || '',
        requestorEmail: patient.requestor?.email || '',
        requestorAddress: patient.requestor?.address?.fullAddress || '',
        requestorCity: patient.requestor?.address?.city || '',
        requestorDistrict: patient.requestor?.address?.district || '',
        requestorState: patient.requestor?.address?.state || '',
        requestorPincode: patient.requestor?.address?.pincode || '',
        requestorProfilePic: null,
        relationToPatient: patient.requestor?.relation || '',
        requestorEmergencyPhone: patient.requestor?.emergencyPhone || '',
        requestorJobDetails: patient.requestor?.jobDetails || '',

        patientDOB: patient.dob || '',
        requestorDOB: patient.requestor?.dob || '',
      });
    }
  }, [patient, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleProfileImageChange = (field: 'requestorProfilePic' | 'patientProfilePic', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

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

  // Age calculation helper
  const calculateAge = (dob?: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : '';
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

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

    // Validate DOBs
    if (formData.patientDOB && isNaN(Date.parse(formData.patientDOB)))
      errors.patientDOB = "Invalid date of birth";
    if (formData.requestorDOB && isNaN(Date.parse(formData.requestorDOB)))
      errors.requestorDOB = "Invalid date of birth";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !patient?._id) return;
    
    setIsSubmitting(true);
    try {
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
        preferredCaregiverGender: formData.preferredCaregiverGender,

        requestorName: formData.requestorName,
        requestorPhone: formData.requestorPhone,
        requestorEmail: formData.requestorEmail,
        requestorAddress: formData.requestorAddress,
        requestorCity: formData.requestorCity,
        requestorDistrict: formData.requestorDistrict,
        requestorState: formData.requestorState,
        requestorPincode: formData.requestorPincode,
        requestorProfilePic: formData.requestorProfilePic,
        relationToPatient: formData.relationToPatient,
        requestorEmergencyPhone: formData.requestorEmergencyPhone,
        requestorJobDetails: formData.requestorJobDetails,
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
    let error = '';
    switch (id) {
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
      case 'patientDOB':
        if (formData.patientDOB && isNaN(Date.parse(formData.patientDOB)))
          error = "Invalid date of birth";
        break;
      case 'requestorDOB':
        if (formData.requestorDOB && isNaN(Date.parse(formData.requestorDOB)))
          error = "Invalid date of birth";
        break;
      default:
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

  const baseInputStyles = `
    w-full border border-gray-200 bg-white rounded-sm py-2 px-3 text-sm text-gray-800 
    placeholder:text-gray-400
    focus:border-gray-400 focus:outline-none focus:ring-0 
    transition-colors duration-200 appearance-none
  `;
  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
  const sectionStyles = "p-5 bg-white rounded-sm border border-gray-100 mb-4";
  const sectionHeaderStyles = "text-xs font-semibold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2";
  const errorStyles = "mt-1 text-xs text-red-500";

  const FormField = ({ 
    label, 
    id, 
    type = 'text', 
    value, 
    onChange, 
    onBlur,
    error,
    options = [],
    placeholder = '',
    required = false
  }: { 
    label: string; 
    id: string; 
    type?: string; 
    value: string | number | null | undefined; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur?: () => void;
    error?: string;
    options?: Array<{value: string; label: string}>;
    placeholder?: string;
    required?: boolean;
  }) => {
    return (
      <div className="w-full">
        <label htmlFor={id} className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {type === 'select' ? (
          <select
            id={id}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            className={`${baseInputStyles} ${error ? 'border-red-300' : ''}`}
            required={required}
            style={{ backgroundImage: 'none' }}
          >
            <option value="" className="text-gray-400">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            id={id}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={3}
            className={`${baseInputStyles} ${error ? 'border-red-300' : ''}`}
            required={required}
          />
        ) : (
          <input
            type={type}
            id={id}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`${baseInputStyles} ${error ? 'border-red-300' : ''}`}
            required={required}
          />
        )}
        {error && <p className={errorStyles}>{error}</p>}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-sm shadow-xl border border-gray-200">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between rounded-t-sm shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Edit Profile Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-sm transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 space-y-4">
          <div className={sectionStyles}>
            <h3 className={sectionHeaderStyles}>Requestor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Details</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField 
                    label="Requestor Full Name" 
                    id="requestorName" 
                    value={formData.requestorName} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorName')}
                    error={formErrors.requestorName || requestorNameValidation.nameError}
                    required
                  />
                  <div>
                    <label htmlFor="requestorDOB" className={labelStyles}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="requestorDOB"
                      value={formData.requestorDOB || ''}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('requestorDOB')}
                      className={`${baseInputStyles} ${formErrors.requestorDOB ? 'border-red-300' : ''}`}
                    />
                    {formErrors.requestorDOB && <p className={errorStyles}>{formErrors.requestorDOB}</p>}
                  </div>
                  <div>
                    <label htmlFor="requestorAgeDisplay" className={labelStyles}>
                      Age
                    </label>
                    <div
                      id="requestorAgeDisplay"
                      className="w-full border border-gray-100 bg-gray-50 rounded-sm py-2 px-2 text-sm text-gray-600 text-center select-none truncate"
                    >
                      {calculateAge(formData.requestorDOB) || '-'} <span className="text-xs">yrs</span>
                    </div>
                  </div>
                  <FormField 
                    label="Phone Number" 
                    type="tel" 
                    id="requestorPhone" 
                    value={formData.requestorPhone} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorPhone')}
                    error={formErrors.requestorPhone || requestorPhoneValidation.phoneError}
                    required
                  />
                  <FormField 
                    label="Email Address" 
                    type="email" 
                    id="requestorEmail" 
                    value={formData.requestorEmail} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorEmail')}
                    error={formErrors.requestorEmail || requestorEmailValidation.emailError}
                    required
                  />
                  <FormField
                    label="Relation"
                    id="relationToPatient"
                    type="select"
                    value={formData.relationToPatient}
                    onChange={handleInputChange}
                    options={relationOptions}
                  />
                  <FormField 
                    label="Emergency Phone"
                    type="tel"
                    id="requestorEmergencyPhone"
                    value={formData.requestorEmergencyPhone}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorEmergencyPhone')}
                    error={formErrors.requestorEmergencyPhone}
                  />
                  <FormField 
                    label="Job Details"
                    id="requestorJobDetails"
                    value={formData.requestorJobDetails}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorJobDetails')}
                    error={formErrors.requestorJobDetails}
                  />
                </div>
                <div className="mt-4">
                  <ProfileImageUpload
                    id="requestorProfilePic"
                    label="Requestor's Profile Picture"
                    value={formData.requestorProfilePic}
                    onChange={(file) => handleProfileImageChange('requestorProfilePic', file)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField 
                    label="Address" 
                    type="textarea"
                    id="requestorAddress" 
                    value={formData.requestorAddress} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorAddress')}
                    error={formErrors.requestorAddress}
                  />
                  <FormField 
                    label="City" 
                    id="requestorCity" 
                    value={formData.requestorCity} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorCity')}
                    error={formErrors.requestorCity || requestorCityValidation.error}
                  />
                  <FormField 
                    label="District" 
                    id="requestorDistrict" 
                    value={formData.requestorDistrict} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorDistrict')}
                    error={formErrors.requestorDistrict || requestorDistrictValidation.error}
                  />
                  <FormField 
                    label="State" 
                    id="requestorState" 
                    value={formData.requestorState} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorState')}
                    error={formErrors.requestorState || requestorStateValidation.error}
                  />
                  <FormField 
                    label="Pincode" 
                    id="requestorPincode" 
                    value={formData.requestorPincode} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('requestorPincode')}
                    error={formErrors.requestorPincode || requestorPincodeValidation.pincodeError}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={sectionStyles}>
            <h3 className={sectionHeaderStyles}>Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Personal Details</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField 
                    label="Patient's Full Name" 
                    id="patientName" 
                    value={formData.patientName} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('patientName')}
                    error={formErrors.patientName || patientNameValidation.nameError}
                  />
                  <div>
                    <label htmlFor="patientDOB" className={labelStyles}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="patientDOB"
                      value={formData.patientDOB || ''}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('patientDOB')}
                      className={`${baseInputStyles} ${formErrors.patientDOB ? 'border-red-300' : ''}`}
                    />
                    {formErrors.patientDOB && <p className={errorStyles}>{formErrors.patientDOB}</p>}
                  </div>
                  <div>
                    <label htmlFor="patientAgeDisplay" className={labelStyles}>
                      Age
                    </label>
                    <div
                      id="patientAgeDisplay"
                      className="w-full border border-gray-100 bg-gray-50 rounded-sm py-2 px-2 text-sm text-gray-600 text-center select-none truncate"
                    >
                      {calculateAge(formData.patientDOB) || '-'} <span className="text-xs">yrs</span>
                    </div>
                  </div>
                  <FormField 
                    label="Gender" 
                    id="patientGender"
                    type="select" 
                    value={formData.patientGender} 
                    onChange={handleInputChange} 
                    onBlur={() => handleBlur('patientGender')}
                    error={formErrors.patientGender}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                  <FormField 
                    label="Preferred Caregiver" 
                    id="preferredCaregiverGender"
                    type="select" 
                    value={formData.preferredCaregiverGender} 
                    onChange={handleInputChange} 
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'any', label: 'Any' }
                    ]}
                  />
                  <FormField 
                    label="Phone Number" 
                    type="tel" 
                    id="patientPhone" 
                    value={formData.patientPhone} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('patientPhone')}
                    error={formErrors.patientPhone || patientPhoneValidation.phoneError}
                  />
                </div>
                <div className="mt-4">
                  <ProfileImageUpload
                    id="patientProfilePic"
                    label="Patient's Profile Picture"
                    value={formData.patientProfilePic}
                    onChange={(file) => handleProfileImageChange('patientProfilePic', file)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField 
                    label="Address" 
                    type="textarea"
                    id="patientAddress" 
                    value={formData.patientAddress} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('patientAddress')}
                    error={formErrors.patientAddress}
                  />
                  <FormField 
                    label="City" 
                    id="patientCity" 
                    value={formData.patientCity} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('patientCity')}
                    error={formErrors.patientCity || patientCityValidation.error}
                  />
                  <FormField 
                    label="District" 
                    id="patientDistrict" 
                    value={formData.patientDistrict} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('patientDistrict')}
                    error={formErrors.patientDistrict || patientDistrictValidation.error}
                  />
                  <FormField 
                    label="State" 
                    id="patientState" 
                    value={formData.patientState} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('patientState')}
                    error={formErrors.patientState || patientStateValidation.error}
                  />
                  <FormField 
                    label="Pincode" 
                    id="patientPincode" 
                    value={formData.patientPincode} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('patientPincode')}
                    error={formErrors.patientPincode || patientPincodeValidation.pincodeError}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3 flex justify-end items-center space-x-3 z-10 rounded-b-sm shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-sm text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-0 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;