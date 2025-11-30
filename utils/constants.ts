import { FormPage } from '@/types/agreement.types';

export const dutyPeriodOptions = [
  { value: '', label: 'Select duty period' },
  { value: '1_month_28_days', label: '1 Month (28 Days)' },
  { value: '1_month_30_days', label: '1 Month (30 Days)' },
  { value: '2_months', label: '2 Months' },
  { value: '3_months', label: '3 Months' },
  { value: 'above_3_months', label: 'Above 3 Months' },
];

export const serviceOptions = [
  { value: '', label: 'Select service required' },
  { value: 'elderly_care', label: 'Elderly Care Service (M/F) 24/7' },
  { value: 'nursing_care', label: 'Nursing Care By Professional\'s With Critical Care' },
  { value: 'tracheostomy_care', label: 'Tracheostomy Care' },
  { value: 'home_nursing', label: 'Home Nursing Attendant' },
  { value: 'post_surgical', label: 'Post-Surgical Care' },
  { value: 'physiotherapy', label: 'Physiotherapy Care' },
  { value: 'palliative_care', label: 'Palliative Care' },
  { value: 'delivery_care', label: 'Delivery Care (New Born Care)' },
  { value: 'icu_setup', label: 'ICU Setup @ Home' },
  { value: 'hospital_bystander', label: 'Hospital Bystander Support' },
  { value: 'stay_home', label: 'Stay @Home 24 Hour' },
  { value: 'accident_support', label: 'Accidental Support' },
  { value: 'nursing_assistance', label: 'Nursing Assistance At Home' },
  { value: 'medical_equipment', label: 'Medical Equipment (Rent/Sale)' },
  { value: 'stroke_care', label: 'Stroke Care' },
  { value: 'orthopedic_care', label: 'Orthopedic Care' },
  { value: 'on_call_doctor_nurse', label: 'On Call Doctor/Nurse At-Home' },
  { value: 'baby_care', label: 'Baby Care' },
  { value: 'baby_care_with_house_keeping', label: 'Baby Care with House Keeping' },
  { value: 'home_maid', label: 'Home Maid Services' },
  { value: 'home_maid_helper', label: 'Home Maid (Helper)' },
  { value: 'home_nurse_housekeeper', label: 'Home Nurse & Home maid' } 
];

export const equipmentCategories = {
  bedriddenEquipment: [
    { id: 'hospitalBed', label: 'Hospital Bed' },
    { id: 'adultDiaper', label: 'Adult Diaper' },
    { id: 'disposableUnderpad', label: 'Disposable Underpad' },
    { id: 'pillows', label: 'Pillows' },
    { id: 'bedWedges', label: 'Bed Wedges' },
    { id: 'bedsideCommode', label: 'Bedside Commode' },
    { id: 'patientLift', label: 'Patient Lift' },
    { id: 'bedsideHandRail', label: 'Bedside Hand Rail' },
    { id: 'bedPan', label: 'Bed Pan' },
    { id: 'decubitusMatress', label: 'Decubitus Matress' },
    { id: 'airMatress', label: 'Air Matress' },
    { id: 'bedLift', label: 'Bed Lift' },
    { id: 'bedRail', label: 'Bed Rail' },
    { id: 'overBedTable', label: 'Over Bed Table' },
  ],
  mobilityEquipment: [
    { id: 'wheelChair', label: 'Wheel Chair' },
    { id: 'cane', label: 'Cane' },
    { id: 'walkers', label: 'Walkers' },
    { id: 'crutches', label: 'Crutches' },
    { id: 'electricBackLifter', label: 'Electric Back Lifter' },
  ],
  medicalEquipment: [
    { id: 'examinationGloves', label: 'Examination Gloves' },
    { id: 'noRinseCleanser', label: 'No Rinse Cleanser' },
    { id: 'bathingWipes', label: 'Bathing Wipes' },
    { id: 'bpMeasuringApparatus', label: 'BP Measuring Apparatus' },
    { id: 'bpMonitor', label: 'BP Monitor' },
    { id: 'o2Concentrator', label: 'O2 Concentrator' },
    { id: 'suctionMachine', label: 'Suction Machine' },
    { id: 'ivStand', label: 'IV Stand' },
  ]
};

import { ClientType } from '../types/client.types';

export const clientTypeOptions = [
  { id: 'individual' as ClientType, label: 'Individual' },
  { id: 'organization' as ClientType, label: 'Organization' },
  { id: 'hospital' as ClientType, label: 'Hospital' },
  { id: 'carehome' as ClientType, label: 'Care Home' }
];

export const relationOptions = [
  { value: '', label: 'Select relation' },
  { value: 'self', label: 'Self' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'son_in_law', label: 'Son-in-law' },
  { value: 'daughter_in_law', label: 'Daughter-in-law' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

export const FORM_STEPS: Record<FormPage, { title: string; description: string }> = {
  1: {
    title: 'Client Information',
    description: 'Please fill in your details below'
  },
  2:{
    title: 'Assignment Details',
    description: 'Please provide the details of the assignment'
  },
  3: {
    title: 'Dietary Habits',
    description: 'Please provide details about your dietary habits'
  },
  4: {
    title: 'Terms & Agreements',
    description: 'Review and accept our policies'
  },
};

export const TOTAL_STEPS = 4;

export const INITIAL_FORM_DATA = {
  name: '',
  state: '',
  district: '',
  city: '',
  type: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  agreedToTerms: false,
  agreedToPrivacy: false
};