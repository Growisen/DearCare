import { z } from 'zod';

export const deliveryCareSchema = z.object({
  carePreferred: z.enum(['post_delivery', 'pre_delivery', 'on_delivery']),

  deliveryDate: z.string().refine(v => v === '' || !isNaN(new Date(v).getTime()), 'Invalid date').optional(),
  deliveryType: z.string().optional(),
  motherAllergies: z.string().optional(),
  motherMedications: z.string().optional(),
  numberOfBabies: z.enum(['single', 'twins', 'triplets']).optional(),
  feedingMethod: z.string().optional(),
  babyAllergies: z.string().optional(),
  preferredSchedule: z.string().optional(),
  duties: z.object({
    babyCare: z.boolean(),
    motherCare: z.boolean(),
  }).optional(),

  expectedDueDate: z.string().refine(v => v === '' || !isNaN(new Date(v).getTime()), 'Invalid date').optional(),
  backupContactName: z.string().optional(),
  backupContactNumber: z.string().optional(),
  hospitalName: z.string().optional(),
  doctorName: z.string().optional(),
  medicalHistory: z.string().optional(),

  birthDateTime: z.string().refine(v => v === '' || !isNaN(new Date(v).getTime()), 'Invalid date').optional(),
  roomDetails: z.string().optional(),
  babyGender: z.enum(['male', 'female', '']).optional(),
  babyWeight: z.string().optional(),
});