export const ROLES = [
  'SUPER_ADMIN', 'CLINIC_OWNER', 'BRANCH_MANAGER', 'DOCTOR',
  'RECEPTIONIST', 'ACCOUNTANT', 'LAB_TECHNICIAN', 'PATIENT',
] as const;
export type Role = (typeof ROLES)[number];

export const APPOINTMENT_STATUSES = [
  'CONFIRMED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW',
] as const;
export const PAYMENT_STATUSES = ['PAID', 'PENDING', 'FAILED'] as const;
export const PAYMENT_METHODS = ['UPI', 'CARD', 'CASH', 'ONLINE'] as const;
export const NOTIFICATION_CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'] as const;
