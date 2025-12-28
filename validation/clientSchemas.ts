import { z } from 'zod';
import { ClientCategory } from '@/types/client.types';
import { Duties } from '@/types/homemaid.types';

const dateStr = z.string().refine(v => !isNaN(new Date(v).getTime()), 'Invalid date');

const dateStrOptional = z.string().refine(
  v => v === '' || !isNaN(new Date(v).getTime()),
  'Invalid date'
);

const nameRegex = /^[A-Za-z]+([ .'-][A-Za-z]+)*$/;

const emailStr = z.string().email('Please enter a valid email address');
const phoneRegex = /^\+?[0-9\s-]{10,15}$/;

const phoneStr = z.string()
  .regex(phoneRegex, 'Please enter a valid phone number');

const patientPhoneStr = z.string().refine(
  value => value.trim() === '' || phoneRegex.test(value),
  'Please enter a valid phone number'
);

const emergencyPhoneStr = z.string().refine(
  value => value.trim() === '' || phoneRegex.test(value),
  'Please enter a valid phone number'
);

const staffRequirementSchema = z.object({
  staffType: z.string().optional(),
  count: z.number().int().positive('Count must be > 0'),
  shiftType: z.string().optional(),
  customShiftTiming: z.string().optional(),
});

const baseCommon = z.object({
  prevRegisterNumber: z.string().optional(),
  clientType: z.enum(['individual','organization','hospital','carehome']),
  clientCategory: z.custom<ClientCategory>(),
  generalNotes: z.string().optional(),
  dutyPeriod: z.string().min(1, 'Duty period is required'),
  dutyPeriodReason: z.string().optional(),
});

const individualSchema = baseCommon.extend({
  clientType: z.literal('individual'),
  requestorName: z.string().min(1, 'Requestor name is required').regex(nameRegex, 'Requestor name can contain only letters, spaces, dots, hyphens, and apostrophes'),
  requestorPhone: phoneStr,
  requestorEmail: emailStr,
  relationToPatient: z.string().optional(),
  requestorAddress: z.string().min(1, 'Your address is required'),
  requestorJobDetails: z.string().optional(),
  requestorEmergencyPhone: emergencyPhoneStr.optional(),
  requestorPincode: z.string().min(1, 'Your pincode is required'),
  requestorState: z.string().min(1, 'Your State is required'),
  requestorDistrict: z.string().min(1, 'Your district is required'),
  requestorCity: z.string().min(1, 'Your city is required'),
  requestorDOB: dateStr,
  patientName: z.string().min(1, 'Patient name is required').regex(nameRegex, 'Patient name can contain only letters, spaces, dots, hyphens, and apostrophes'),
  patientDOB: dateStrOptional.optional(),
  patientGender: z.string().optional(),
  patientPhone: patientPhoneStr.optional(),
  patientAddress: z.string().optional(),
  patientPincode: z.string().optional(),
  patientDistrict: z.string().optional(),
  patientState: z.string().optional(),
  patientCity: z.string().optional(),
  requestorProfilePic: z.any().nullable().optional(),
  patientProfilePic: z.any().nullable().optional(),
  serviceRequired: z.string().min(1, 'Service required'),
  careDuration: z.string().optional(),
  startDate: dateStr,
  preferredCaregiverGender: z.string().optional(),
  staffRequirements: z.array(staffRequirementSchema).optional(),
  staffReqStartDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.dutyPeriod === 'above_3_months' && !data.dutyPeriodReason?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please provide a reason for extended duration', path: ['dutyPeriodReason'] });
  }
});

const organizationSchema = baseCommon.extend({
  clientType: z.literal('organization'),
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationType: z.string().min(1, 'Organization type is required'),
  contactPersonName: z.string().min(1, 'Contact person name is required'),
  contactPersonRole: z.string().min(1, 'Contact person role is required'),
  contactPhone: phoneStr,
  contactEmail: emailStr,
  organizationState: z.string().min(1, 'Organization state is required'),
  organizationDistrict: z.string().min(1, 'Organization district is required'),
  organizationCity: z.string().min(1, 'Organization city is required'),
  organizationAddress: z.string().min(1, 'Organization address is required'),
  organizationPincode: z.string().min(1, 'Organization pincode is required'),
  staffRequirements: z.array(staffRequirementSchema).min(1, 'At least one staff requirement'),
  staffReqStartDate: dateStr,

  serviceRequired: z.string().optional(),
  startDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.dutyPeriod === 'above_3_months' && !data.dutyPeriodReason?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please provide a reason for extended duration', path: ['dutyPeriodReason'] });
  }
});

export const clientSchema = z.discriminatedUnion('clientType', [individualSchema, organizationSchema]);

const dutiesSchema: z.ZodType<Duties> = z.object({
  kitchen: z.boolean(),
  bathroom: z.boolean(),
  floors: z.boolean(),
  dusting: z.boolean(),
  tidying: z.boolean(),
  mealPrep: z.boolean(),
  laundry: z.boolean(),
  ironing: z.boolean(),
  errands: z.boolean(),
  childcare: z.boolean(),
});

export const homeMaidSchema = z.object({
  serviceType: z.enum(['part-time','full-time','live-in']).or(z.string()),
  serviceTypeOther: z.string().optional(),
  frequency: z.string().optional(),
  preferredSchedule: z.string().optional(),
  homeType: z.string().optional(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  householdSize: z.number().int().min(1),
  hasPets: z.boolean().optional(),
  petDetails: z.string().optional(),
  duties: dutiesSchema,
  mealPrepDetails: z.string().optional(),
  childcareDetails: z.string().optional(),
  allergies: z.string().optional(),
  restrictedAreas: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type ClientFormSchema = z.infer<typeof clientSchema>;
export type HomeMaidFormSchema = z.infer<typeof homeMaidSchema>;