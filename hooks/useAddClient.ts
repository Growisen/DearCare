import { useState, useCallback } from 'react';
import { ClientCategory, FormData, StaffRequirement, ClientType } from '@/types/client.types';
import { Duties, FormData as HomeMaidFormData } from '@/types/homemaid.types';
import { toast } from 'react-hot-toast';
import { addIndividualClient, addOrganizationClient, addHousemaidRequest } from '@/app/actions/clients/client-actions';
import { useDashboardData } from '@/hooks/useDashboardData';

interface FormErrors {
  [key: string]: string;
}

interface UseClientFormProps {
  onSuccess?: () => void;
  initialData?: Partial<FormData>;
}

const INITIAL_DUTIES: Duties = {
  kitchen: false,
  bathroom: false,
  floors: false,
  dusting: false,
  tidying: false,
  mealPrep: false,
  laundry: false,
  ironing: false,
  errands: false,
  childcare: false,
};

const INITIAL_HOME_MAID_DATA: HomeMaidFormData = {
  serviceType: 'part-time',
  serviceTypeOther: '',
  startDate: '',
  frequency: '',
  preferredSchedule: '',
  homeType: '',
  bedrooms: 1,
  bathrooms: 1,
  householdSize: 1,
  hasPets: undefined,
  petDetails: '',
  duties: INITIAL_DUTIES,
  mealPrepDetails: '',
  childcareDetails: '',
  allergies: '',
  restrictedAreas: '',
  specialInstructions: '',
};

export const useClientForm = ({ onSuccess, initialData = {} }: UseClientFormProps = {}) => {
  const { invalidateDashboardCache } = useDashboardData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientType, setClientType] = useState<ClientType>(
    initialData.clientType || 'individual'
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [isSameAddress, setIsSameAddress] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    clientType: 'individual',
    clientCategory: 'DearCare LLP',
    prevRegisterNumber: '',
    dutyPeriod: '',
    dutyPeriodReason: '',
    requestorName: '',
    requestorPhone: '',
    requestorEmail: '',
    relationToPatient: '',
    requestorAddress: '',
    requestorJobDetails: '',
    requestorEmergencyPhone: '',
    requestorPincode: '',
    requestorState: '',
    requestorDistrict: '',
    requestorCity: '',
    patientName: '',
    patientDOB: '',
    patientGender: '',
    patientPhone: '',
    patientAddress: '',
    patientPincode: '',
    patientDistrict: '',
    patientState: '',
    patientCity: '',
    requestorProfilePic: null,
    patientProfilePic: null,
    organizationName: '',
    organizationType: '',
    contactPersonName: '',
    contactPersonRole: '',
    contactPhone: '',
    contactEmail: '',
    organizationState: '',
    organizationDistrict: '',
    organizationCity: '',
    organizationAddress: '',
    organizationPincode: '',
    serviceRequired: '',
    careDuration: '',
    startDate: '',
    preferredCaregiverGender: '',
    generalNotes: '',
    staffRequirements: [{
      staffType: '',
      count: 1,
      shiftType: '',
      customShiftTiming: '',
    }],
    staffReqStartDate: '',
    requestorDOB: '',
    ...initialData
  });

  const [homeMaidFormData, setHomeMaidFormData] = useState<HomeMaidFormData>(INITIAL_HOME_MAID_DATA);
  const [homeMaidFormErrors, setHomeMaidFormErrors] = useState<FormErrors>({});

  const fieldLabels: {[key: string]: string} = {
    dutyPeriod: 'Duty period',
    dutyPeriodReason: 'Reason for extended duration',
    requestorName: 'Your name',
    requestorPhone: 'Your phone number',
    requestorEmail: 'Your email address',
    relationToPatient: 'Relation to patient',
    patientName: 'Patient name',
    patientDOB: 'Patient date of birth',
    patientGender: 'Patient gender',
    patientPhone: 'Patient phone number',
    serviceRequired: 'Service required',
    careDuration: 'Care duration',
    startDate: 'Start date',
    organizationName: 'Organization name',
    organizationType: 'Organization type',
    contactPersonName: 'Contact person name',
    contactPersonRole: 'Contact person role',
    contactPhone: 'Contact phone',
    contactEmail: 'Contact email',
    organizationState: 'Organization state',
    organizationDistrict: 'Organization district',
    organizationCity: 'Organization city',
    organizationAddress: 'Organization address',
    organizationPincode: 'Organization pincode',
    preferredCaregiverGender: 'Preferred caregiver gender',
    staffReqStartDate: 'Staff requirement start date',
    requestorAddress: 'Your address',
    requestorPincode: 'Your pincode',
    requestorCity: 'Your city',
    requestorDistrict: 'Your district',
    requestorState: 'Your State',
    patientAddress: 'Patient address',
    patientPincode: 'Patient pincode',
    patientCity: 'Patient city',
    patientDistrict: 'Patient district',
    patientState: 'Patient State',
    requestorJobDetails: 'Your job details',
    requestorEmergencyPhone: 'Emergency contact number',
    requestorDOB: 'Your date of birth',
  };

  const validateField = (id: string, value: string): string => {
    if (!value.trim()) return '';
    
    switch (id) {
      case 'requestorEmail':
      case 'contactEmail':
        return validateEmail(value);
      case 'requestorPhone':
      case 'patientPhone':
      case 'contactPhone':
        return validatePhone(value);
      case 'patientDOB':
      case 'requestorDOB':
        return isValidDate(value) ? '' : 'Please enter a valid date';
      case 'patientGender':
      case 'preferredCaregiverGender':
        return value === '' ? 'Please select a gender option' : '';
      case 'serviceRequired':
        return value === '' ? 'Please select a required service' : '';

      case 'dutyPeriod':
        return value === '' ? 'Please select a duty period' : '';
      case 'dutyPeriodReason':
        if (formData.dutyPeriod === 'above_3_months' && !value.trim()) {
          return 'Please provide a reason for extended duration';
        }
        return '';
      case 'startDate':
      case 'staffReqStartDate':
        return isValidDate(value) ? '' : 'Please enter a valid date';
      default:
        return '';
    }
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address';
  };

  const validatePhone = (phone: string): string => {
    const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
    return phoneRegex.test(phone) ? '' : 'Please enter a valid phone number';
  };

  // Helper to determine if a field is required based on client type
  const isRequiredField = (id: string, type: ClientType): boolean => {
    const commonRequired = ['dutyPeriod'];

    if (id === 'dutyPeriodReason' && formData.dutyPeriod === 'above_3_months') {
      return true;
    }

    const individualRequired = [
      'requestorName', 'requestorPhone', 'requestorEmail',
      'serviceRequired', 'startDate', 'requestorState',
      'requestorAddress', 'requestorPincode', 'requestorCity', 'requestorDistrict',
      'requestorDOB', // new required field
      'patientDOB',   // replaces patientAge
    ];
    
    const organizationRequired = [
      'organizationName', 'organizationType', 'contactPersonName', 
      'contactPersonRole', 'contactPhone', 'contactEmail', 
      'organizationState', 'organizationDistrict', 'organizationCity',
      'organizationAddress', 'organizationPincode', 'staffReqStartDate'
    ];
    
    return commonRequired.includes(id) || (type === 'individual' 
      ? individualRequired.includes(id)
      : organizationRequired.includes(id));
  };

  // Updated handleInputChange to clear errors
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => {
      // Basic update
      const newState = {
        ...prev,
        [id as keyof FormData]: value
      };
      
      // If addresses are synced and a requestor address field changes, update corresponding patient field
      if (isSameAddress && 
          ['requestorAddress', 'requestorPincode', 'requestorCity', 'requestorDistrict', 'requestorState'].includes(id)) {
        const patientField = id.replace('requestor', 'patient');
        (newState[patientField as keyof Pick<FormData, 'patientAddress' | 'patientPincode' | 'patientCity' | 'patientDistrict' | 'patientState'>]) = value;
      }
      
      return newState;
    });
  
    // Clear error when user starts typing
    if (formErrors[id]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  }, [formErrors, isSameAddress]);

  const handleBlur = (id: string) => {
    setTouched(prev => ({
      ...prev,
      [id]: true
    }));

    // Validate field
    const value = formData[id as keyof FormData] as string;
    const error = validateField(id, value);
    
    // Set error if field is required and empty
    const isRequired = isRequiredField(id, clientType);
    const isEmpty = !value || (typeof value === 'string' && !value.trim());
    
    setFormErrors(prev => ({
      ...prev,
      [id]: error || (touched[id] && isRequired && isEmpty ? `${fieldLabels[id] || 'This field'} is required` : '')
    }));
  };

  const handleProfileImageChange = (field: 'requestorProfilePic' | 'patientProfilePic', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleStaffRequirementsChange = (staffRequirements: StaffRequirement[], startDate?: string) => {
    setFormData(prev => ({
      ...prev,
      staffRequirements,
      staffReqStartDate: startDate !== undefined ? startDate : prev.staffReqStartDate
    }));
  };

  const handleClientTypeChange = (type: ClientType) => {
    setClientType(type);
    setFormData(prev => ({
      ...prev,
      clientType: type
    }));

    setFormErrors({});
    setTouched({});
  };

  const handleClientCategoryChange = (category: ClientCategory) => {
    setFormData(prev => ({
      ...prev,
      clientCategory: category
    }));

    setFormErrors({});
    setTouched({});
  };

  // Validate all fields before submission
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const commonRequired = ['dutyPeriod'];
    
    if (formData.dutyPeriod === 'above_3_months' && !formData.dutyPeriodReason?.trim()) {
      newErrors.dutyPeriodReason = 'Please provide a reason for extended duration';
      isValid = false;
    }
    
    const requiredFields = [
      ...commonRequired,
      ...(clientType === 'individual' 
        ? [
            'requestorName', 'requestorPhone', 'requestorEmail', 
            'serviceRequired', 'startDate', 'requestorState',
            'requestorAddress', 'requestorPincode', 'requestorCity', 'requestorDistrict',
            'requestorDOB',
          ]
        : [
            'organizationName', 'organizationType', 'contactPersonName', 'contactPersonRole',
            'contactPhone', 'contactEmail', 'organizationState', 'organizationDistrict', 'organizationCity',
            'organizationAddress', 'organizationPincode', 'staffReqStartDate'])
    ];

    for (const field of requiredFields) {
      const value = formData[field as keyof FormData];
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field] = `${fieldLabels[field] || 'This field'} is required`;
        isValid = false;
      }
    }

    for (const field of Object.keys(formData)) {
      const value = formData[field as keyof FormData];
      if (typeof value === 'string' && value.trim()) {
        const error = validateField(field, value);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    }
    
    if (clientType !== 'individual') {
      if (!formData.staffRequirements || formData.staffRequirements.length === 0) {
        newErrors.staffRequirements = 'Please add at least one staff requirement';
        isValid = false;
      } else {
        for (let i = 0; i < formData.staffRequirements.length; i++) {
          const req = formData.staffRequirements[i];
          if (!req.staffType || !req.shiftType) {
            newErrors[`staffRequirement-${i}`] = 'Please complete all staff requirement fields';
            isValid = false;
            break;
          }
        }
      }
      
      if (!formData.staffReqStartDate) {
        newErrors.staffReqStartDate = 'Start date is required';
        isValid = false;
      }
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setIsSameAddress(checked);
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        patientAddress: formData.requestorAddress,
        patientPincode: formData.requestorPincode,
        patientCity: formData.requestorCity,
        patientDistrict: formData.requestorDistrict,
        patientState: formData.requestorState
      }));
      
      setFormErrors(prev => ({
        ...prev,
        patientAddress: '',
        patientPincode: '',
        patientCity: '',
        patientDistrict: '',
        patientState: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patientAddress: '',
        patientPincode: '',
        patientCity: '',
        patientDistrict: '',
        patientState: ''
      }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      console.log("validation failed")
      toast.error("Please correct the errors in the form");
      return;
    }

    console.log("submitting")

    try {
      setIsSubmitting(true);
      let result;

      if (clientType === 'individual') {
        result = await addIndividualClient({
          prevRegisterNumber: formData.prevRegisterNumber,
          clientType,
          clientCategory: formData.clientCategory as ClientCategory,
          generalNotes: formData.generalNotes,
          dutyPeriod: formData.dutyPeriod,
          dutyPeriodReason: formData.dutyPeriodReason,
          requestorName: formData.requestorName,
          requestorPhone: formData.requestorPhone,
          requestorEmail: formData.requestorEmail,
          relationToPatient: formData.relationToPatient,
          requestorAddress: formData.requestorAddress,
          requestorJobDetails: formData.requestorJobDetails,
          requestorEmergencyPhone: formData.requestorEmergencyPhone,
          requestorPincode: formData.requestorPincode,
          requestorDistrict: formData.requestorDistrict,
          requestorState: formData.requestorState,
          requestorCity: formData.requestorCity,
          patientName: formData.patientName,
          patientDOB: formData.patientDOB,
          requestorDOB: formData.requestorDOB,
          patientGender: formData.patientGender,
          patientPhone: formData.patientPhone || '',
          patientAddress: formData.patientAddress,
          patientPincode: formData.patientPincode,
          patientDistrict: formData.patientDistrict,
          patientState: formData.patientState,
          patientCity: formData.patientCity,     
          serviceRequired: formData.serviceRequired,
          careDuration: formData.careDuration,
          startDate: formData.startDate,
          preferredCaregiverGender: formData.preferredCaregiverGender || '',
          patientProfilePic: formData.patientProfilePic,
          requestorProfilePic: formData.requestorProfilePic,
        });
      } else {
        result = await addOrganizationClient({
          prevRegisterNumber: formData.prevRegisterNumber,
          clientType,
          clientCategory: formData.clientCategory as ClientCategory,
          generalNotes: formData.generalNotes,
          dutyPeriod: formData.dutyPeriod,
          dutyPeriodReason: formData.dutyPeriodReason,
          organizationName: formData.organizationName,
          organizationType: formData.organizationType || '',
          contactPersonName: formData.contactPersonName,
          contactPersonRole: formData.contactPersonRole || '',
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          organizationState: formData.organizationState || '',
          organizationDistrict: formData.organizationDistrict || '',
          organizationCity: formData.organizationCity || '',
          organizationAddress: formData.organizationAddress,
          organizationPincode: formData.organizationPincode || '',
          staffRequirements: formData.staffRequirements,
          staffReqStartDate: formData.staffReqStartDate || '',
        });
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to add client');
      }

      const homeMaidResult = await addHousemaidRequest({
        clientId: result.id, 
        ...homeMaidFormData,
      });

      if (!homeMaidResult.success) {
        throw new Error(homeMaidResult.error || 'Failed to add home maid request');
      }

      invalidateDashboardCache();
      setIsSuccess(true);
      toast.success(`${clientType === 'individual' ? 'Individual' : 'Organization'} client and Home Maid request added successfully!`);

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error adding client or home maid request:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHomeMaidInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setHomeMaidFormData(prev => ({ ...prev, [name]: value }));
      if (homeMaidFormErrors[name]) {
        setHomeMaidFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    },
    [homeMaidFormErrors]
  );

  const handleHomeMaidDutyChange = (key: keyof Duties) => {
    setHomeMaidFormData(prev => ({
      ...prev,
      duties: {
        ...prev.duties,
        [key]: !prev.duties[key],
      },
    }));
  };

  return {
    formData,
    formErrors,
    clientType,
    isSubmitting,
    isSuccess,
    isSameAddress,
    handleInputChange,
    handleBlur,
    handleProfileImageChange,
    handleStaffRequirementsChange,
    handleClientTypeChange,
    handleClientCategoryChange,
    handleSameAddressToggle,
    handleSubmit,
    validateForm,
    setIsSuccess,
    homeMaidFormData,
    setHomeMaidFormData,
    homeMaidFormErrors,
    setHomeMaidFormErrors,
    handleHomeMaidInputChange,
    handleHomeMaidDutyChange,
  };
};