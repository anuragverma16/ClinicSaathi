import { Schema, model } from 'mongoose';
import { APPOINTMENT_STATUSES, PAYMENT_STATUSES } from '../utils/constants';

const appointmentSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    service: { type: String, required: true },
    appointmentDate: { type: Date, required: true, index: true },
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: 'CONFIRMED', index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'PENDING' },
    notes: String,
    source: { type: String, enum: ['WEB', 'RECEPTION', 'PORTAL', 'WHATSAPP', 'AI'], default: 'RECEPTION' },
  },
  { timestamps: true }
);

// DB-level double-booking protection for active appointments
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['CONFIRMED', 'WAITING', 'IN_PROGRESS'] } } }
);

export const Appointment = model('Appointment', appointmentSchema);
