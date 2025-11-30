import { useState, useCallback } from 'react';
import { ClientCategory, FormData, StaffRequirement, ClientType } from '@/types/client.types';
import { Duties, FormData as HomeMaidFormData } from '@/types/homemaid.types';
import { DeliveryCareFormData } from '@/types/deliveryCare.types';
import { toast } from 'react-hot-toast';
import { addIndividualClient, addOrganizationClient, addHousemaidRequest, addDeliveryCareRequest, addChildCareRequest } from '@/app/actions/clients/client-actions';
import { useDashboardData } from '@/hooks/useDashboardData';
import { clientSchema, homeMaidSchema } from '@/validation/clientSchemas';
import { z } from 'zod';

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

const INITIAL_DELIVERY_CARE_DATA: DeliveryCareFormData = {
  carePreferred: 'post_delivery',
  deliveryDate: '',
  deliveryType: '',
  motherAllergies: '',
  motherMedications: '',
  numberOfBabies: 'single',
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
};

export interface ChildCareFormData {
  numberOfChildren: string;
  agesOfChildren: string;
  careNeeds: {
    infantCare: boolean;
    youngChildCare: boolean;
    schoolAgeSupport: boolean;
    specialNeeds: boolean;
    healthIssues: boolean;
  };
  careNeedsDetails: string;
  notes: string;
  primaryFocus: 'child_care_priority' | 'both_equal';
  homeTasks: {
    laundry: boolean;
    mealPrep: boolean;
    tidyAreas: boolean;
    washDishes: boolean;
    generalTidyUp: boolean;
    other: boolean;
  };
  homeTasksDetails: string;
}

const INITIAL_CHILD_CARE_DATA: ChildCareFormData = {
  numberOfChildren: '',
  agesOfChildren: '',
  careNeeds: {
    infantCare: false,
    youngChildCare: false,
    schoolAgeSupport: false,
    specialNeeds: false,
    healthIssues: false,
  },
  careNeedsDetails: '',
  notes: '',
  primaryFocus: 'child_care_priority',
  homeTasks: {
    laundry: false,
    mealPrep: false,
    tidyAreas: false,
    washDishes: false,
    generalTidyUp: false,
    other: false,
  },
  homeTasksDetails: '',
};

export const useClientForm = ({ onSuccess, initialData = {} }: UseClientFormProps = {}) => {
  const { invalidateDashboardCache } = useDashboardData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientType, setClientType] = useState<ClientType>(
    initialData.clientType || 'individual'
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
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

  const [deliveryCareFormData, setDeliveryCareFormData] = useState<DeliveryCareFormData>(INITIAL_DELIVERY_CARE_DATA);
  const [deliveryCareFormErrors, setDeliveryCareFormErrors] = useState<FormErrors>({});

  const [childCareFormData, setChildCareFormData] = useState<ChildCareFormData>(INITIAL_CHILD_CARE_DATA);

  const toErrorMap = (issues: z.ZodIssue[]): Record<string,string> =>
    issues.reduce((acc, issue) => {
      const pathKey = issue.path.join('.');
      if (!acc[pathKey]) acc[pathKey] = issue.message;
      return acc;
    }, {} as Record<string,string>);

  const handleBlur = (id: string) => {
    const parsed = clientSchema.safeParse({ ...formData });
    if (!parsed.success) {
      const errs = toErrorMap(parsed.error.issues);
      setFormErrors(prev => ({ ...prev, [id]: errs[id] || '' }));
    } else {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [id]: value };
      if (isSameAddress && ['requestorAddress','requestorPincode','requestorCity','requestorDistrict','requestorState'].includes(id)) {
        const patientField = id.replace('requestor','patient');
        if (patientField in next) {
          (next as Record<string, unknown>)[patientField] = value;
        }
      }
      return next;
    });
    setFormErrors(prev => ({ ...prev, [id]: '' }));
  }, [isSameAddress]);

  const validateForm = (): boolean => {
    const parsed = clientSchema.safeParse(formData);
    if (!parsed.success) {
      setFormErrors(toErrorMap(parsed.error.issues));
      return false;
    }
    if (formData.clientType === 'individual' && formData.serviceRequired === 'home_maid') {
      const hmParsed = homeMaidSchema.safeParse(homeMaidFormData);
      if (!hmParsed.success) {
        setHomeMaidFormErrors(toErrorMap(hmParsed.error.issues));
        return false;
      }
    }
    setFormErrors({});
    setHomeMaidFormErrors({});
    return true;
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
  };

  const handleClientCategoryChange = (category: ClientCategory) => {
    setFormData(prev => ({
      ...prev,
      clientCategory: category
    }));

    setFormErrors({});
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
    toast.error("Please correct the errors in the form");
    return;
  }

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

    if (formData.serviceRequired === 'home_maid') {
      const homeMaidResult = await addHousemaidRequest({
        clientId: result.id, 
        ...homeMaidFormData,
      });

      if (!homeMaidResult.success) {
        throw new Error(homeMaidResult.error || 'Failed to add home maid request');
      }
    }

    if (formData.serviceRequired === 'delivery_care') {
      const deliveryCareResult = await addDeliveryCareRequest({
        clientId: result.id,
        ...deliveryCareFormData,
      });

      if (!deliveryCareResult.success) {
        throw new Error(deliveryCareResult.error || 'Failed to add delivery care request');
      }
    }

    // ADD THIS BLOCK FOR BABY CARE SERVICES
    if (
      formData.serviceRequired === 'baby_care' ||
      formData.serviceRequired === 'baby_care_with_house_keeping'
    ) {
      const childCareResult = await addChildCareRequest({
        clientId: result.id,
        ...childCareFormData,
      });

      if (!childCareResult.success) {
        throw new Error(childCareResult.error || 'Failed to add child care request');
      }
    }

    invalidateDashboardCache();
    setIsSuccess(true);
    toast.success(`${clientType === 'individual' ? 'Individual' : 'Organization'} client and ${
      formData.serviceRequired === 'home_maid'
        ? 'Home Maid'
        : formData.serviceRequired === 'delivery_care'
        ? 'Delivery Care'
        : formData.serviceRequired === 'baby_care' || formData.serviceRequired === 'baby_care_with_house_keeping'
        ? 'Child Care'
        : ''
    } request added successfully!`);

    if (onSuccess) {
      onSuccess();
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error adding client or request:', errorMessage);
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

  const handleDeliveryCareInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setDeliveryCareFormData(prev => ({ ...prev, [name]: value }));
      if (deliveryCareFormErrors[name]) {
        setDeliveryCareFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    },
    [deliveryCareFormErrors]
  );

  const handleDeliveryCareDutyChange = (key: keyof DeliveryCareFormData['duties']) => {
    setDeliveryCareFormData(prev => ({
      ...prev,
      duties: {
        ...prev.duties,
        [key]: !prev.duties[key],
      },
    }));
  };

  const handleChildCareInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setChildCareFormData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleChildCareCheckboxChange = (section: 'careNeeds' | 'homeTasks', key: string) => {
    setChildCareFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]],
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
    setIsSuccess,
    homeMaidFormData,
    setHomeMaidFormData,
    homeMaidFormErrors,
    setHomeMaidFormErrors,
    handleHomeMaidInputChange,
    handleHomeMaidDutyChange,
    deliveryCareFormData,
    setDeliveryCareFormData,
    deliveryCareFormErrors,
    setDeliveryCareFormErrors,
    handleDeliveryCareInputChange,
    handleDeliveryCareDutyChange,
    childCareFormData,
    setChildCareFormData,
    handleChildCareInputChange,
    handleChildCareCheckboxChange,
  };
};