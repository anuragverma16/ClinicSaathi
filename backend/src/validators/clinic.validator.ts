import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const patientInput = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^(?:\+91[\s-]?)?[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  age: z.coerce.number().int().min(1).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().trim().max(500).optional(),
  medicalNotes: z.string().trim().max(2000).optional(),
});

export const doctorInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().regex(/^(?:\+91[\s-]?)?[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  password: z.string().min(8),
  specialization: z.string().trim().min(2).max(120),
  qualification: z.string().trim().max(200).optional(),
  consultationFee: z.coerce.number().min(0).default(0),
  experience: z.coerce.number().int().min(0).max(80).default(0),
});

export const doctorUpdateInput = doctorInput.omit({ email: true, password: true }).partial();

const appointmentFields = z.object({
  patientId: objectId,
  doctorId: objectId,
  service: z.string().trim().min(2).max(160),
  appointmentDate: z.coerce.date(),
  startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  notes: z.string().trim().max(2000).optional(),
});

export const appointmentInput = appointmentFields.refine((value) => {
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  return minutes(value.endTime) > minutes(value.startTime);
}, { message: 'End time must be after start time', path: ['endTime'] });

export const appointmentUpdateInput = appointmentFields.partial().extend({
  status: z.enum(['CONFIRMED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
}).refine((value) => {
  if (!value.startTime || !value.endTime) return true;
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  return minutes(value.endTime) > minutes(value.startTime);
}, { message: 'End time must be after start time', path: ['endTime'] });
