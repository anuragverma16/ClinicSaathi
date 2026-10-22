import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  clinicName: z.string().min(2, 'Clinic name is required'),
});
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const forgotSchema = z.object({ email: z.string().email() });
export const resetSchema = z.object({ token: z.string().min(10), password: z.string().min(8) });
