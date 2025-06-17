import React, { useState, useEffect, useRef } from 'react';
import { 
  useNameValidation, 
  useEmailValidation, 
  usePhoneValidation, 
  useTextFieldValidation,
  usePincodeValidation
} from '@/hooks/useValidation';

interface OrganizationDetails {
  organization_name: string;
  contact_person_name: string;
  contact_person_role: string;
  contact_email: string;
  contact_phone: string;
  organization_address: string;
  organization_state: string;
  organization_district: string;
  organization_city: string;
  organization_pincode: string;
}

interface EditOrganizationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: {details: OrganizationDetails, general_notes?: string}) => Promise<void>;
  organizationData: {
    details: OrganizationDetails;
    general_notes?: string;
  } | null;
}

const EditOrganizationDetailsModal: React.FC<EditOrganizationDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  organizationData
}) => {
  // Organization name validation
  const {
    name: organizationName,
    setName: setOrganizationName,
    nameError: organizationNameError,
    checkNameValidity: checkOrganizationNameValidity
  } = useNameValidation(organizationData?.details.organization_name || '');
  
  // Contact person name validation
  const {
    name: contactPersonName,
    setName: setContactPersonName,
    nameError: contactPersonNameError,
    checkNameValidity: checkContactPersonNameValidity
  } = useNameValidation(organizationData?.details.contact_person_name || '');
  
  // Contact email validation
  const {
    email,
    setEmail,
    emailError,
    checkEmailValidity
  } = useEmailValidation(organizationData?.details.contact_email || '');
  
  // Contact phone validation
  const {
    phone,
    setPhone,
    phoneError,
    checkPhoneValidity
  } = usePhoneValidation(organizationData?.details.contact_phone || '');
  
  // Address validation (simple text field)
  const {
    value: address,
    setValue: setAddress,
    error: addressError,
    checkValidity: checkAddressValidity
  } = useTextFieldValidation(organizationData?.details.organization_address || '', 'Address');
  
  // City validation
  const {
    value: city,
    setValue: setCity,
    error: cityError,
    checkValidity: checkCityValidity
  } = useTextFieldValidation(organizationData?.details.organization_city || '', 'City', true);
  
  // District validation
  const {
    value: district,
    setValue: setDistrict,
    error: districtError,
    checkValidity: checkDistrictValidity
  } = useTextFieldValidation(organizationData?.details.organization_district || '', 'District', true);
  
  // State validation
  const {
    value: state,
    setValue: setState,
    error: stateError,
    checkValidity: checkStateValidity
  } = useTextFieldValidation(organizationData?.details.organization_state || '', 'State', true);
  
  // Pincode validation
  const {
    pincode,
    setPincode,
    pincodeError,
    checkPincodeValidity
  } = usePincodeValidation(organizationData?.details.organization_pincode || '');
  
  // For fields that don't require strict validation
  const [contactPersonRole, setContactPersonRole] = useState(organizationData?.details.contact_person_role || '');
  const [generalNotes, setGeneralNotes] = useState(organizationData?.general_notes || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Update form data when organizationData changes
  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.details.organization_name || '');
      setContactPersonName(organizationData.details.contact_person_name || '');
      setContactPersonRole(organizationData.details.contact_person_role || '');
      setEmail(organizationData.details.contact_email || '');
      setPhone(organizationData.details.contact_phone || '');
      setAddress(organizationData.details.organization_address || '');
      setCity(organizationData.details.organization_city || '');
      setDistrict(organizationData.details.organization_district || '');
      setState(organizationData.details.organization_state || '');
      setPincode(organizationData.details.organization_pincode || '');
      setGeneralNotes(organizationData.general_notes || '');
    }
  }, [organizationData]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const validateForm = () => {
    // Use each field's validation function
    const isOrgNameValid = checkOrganizationNameValidity();
    const isContactNameValid = checkContactPersonNameValidity();
    const isEmailValid = checkEmailValidity();
    const isPhoneValid = checkPhoneValidity();
    
    // Return true only if required fields are valid
    return isOrgNameValid && isContactNameValid && isEmailValid && isPhoneValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Construct the updated organization details
      const updatedData = {
        details: {
          organization_name: organizationName,
          contact_person_name: contactPersonName,
          contact_person_role: contactPersonRole,
          contact_email: email,
          contact_phone: phone,
          organization_address: address,
          organization_state: state,
          organization_district: district,
          organization_city: city,
          organization_pincode: pincode
        },
        general_notes: generalNotes
      };
      
      await onSave(updatedData);
      onClose();
    } catch (error) {
      console.error('Failed to save organization details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 sm:p-0">
        <div ref={modalRef} className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-semibold text-gray-800">Edit Organization Details</h2>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Information</h3>
                
                <div>
                  <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700">
                    Organization Name*
                  </label>
                  <input
                    type="text"
                    id="organization_name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    onBlur={checkOrganizationNameValidity}
                    className={`w-full border ${organizationNameError ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {organizationNameError && (
                    <p className="mt-1 text-sm text-red-600">{organizationNameError}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact_person_name" className="block text-sm font-medium text-gray-700">
                      Contact Person Name*
                    </label>
                    <input
                      type="text"
                      id="contact_person_name"
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                      onBlur={checkContactPersonNameValidity}
                      className={`w-full border ${contactPersonNameError ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {contactPersonNameError && (
                      <p className="mt-1 text-sm text-red-600">{contactPersonNameError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="contact_person_role" className="block text-sm font-medium text-gray-700">
                      Contact Person Role
                    </label>
                    <input
                      type="text"
                      id="contact_person_role"
                      value={contactPersonRole}
                      onChange={(e) => setContactPersonRole(e.target.value)}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="contact_email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={checkEmailValidity}
                      className={`w-full border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {emailError && (
                      <p className="mt-1 text-sm text-red-600">{emailError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                      Phone Number*
                    </label>
                    <input
                      type="text"
                      id="contact_phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={checkPhoneValidity}
                      className={`w-full border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                
                <div>
                  <label htmlFor="organization_address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="organization_address"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={checkAddressValidity}
                    className={`w-full border ${addressError ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {addressError && (
                    <p className="mt-1 text-sm text-red-600">{addressError}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="organization_city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="organization_city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onBlur={checkCityValidity}
                      className={`w-full border ${cityError ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {cityError && (
                      <p className="mt-1 text-sm text-red-600">{cityError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="organization_district" className="block text-sm font-medium text-gray-700">
                      District
                    </label>
                    <input
                      type="text"
                      id="organization_district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      onBlur={checkDistrictValidity}
                      className={`w-full border ${districtError ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {districtError && (
                      <p className="mt-1 text-sm text-red-600">{districtError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="organization_state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      id="organization_state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      onBlur={checkStateValidity}
                      className={`w-full border ${stateError ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {stateError && (
                      <p className="mt-1 text-sm text-red-600">{stateError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="organization_pincode" className="block text-sm font-medium text-gray-700">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      id="organization_pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      onBlur={checkPincodeValidity}
                      className={`w-full border ${pincodeError ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {pincodeError && (
                      <p className="mt-1 text-sm text-red-600">{pincodeError}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                
                <div>
                  <label htmlFor="general_notes" className="block text-sm font-medium text-gray-700">
                    General Notes
                  </label>
                  <textarea
                    id="general_notes"
                    rows={3}
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional notes or information about this organization..."
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Modal Footer - Sticky at bottom */}
          <div className="sticky bottom-0 flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
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

export default EditOrganizationDetailsModal;