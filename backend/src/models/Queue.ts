import { Schema, model } from 'mongoose';

const queueSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    tokenNumber: { type: Number, required: true },
    date: { type: String, required: true, index: true }, // "YYYY-MM-DD" (tokens reset daily)
    status: {
      type: String,
      enum: ['WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'EMERGENCY'],
      default: 'WAITING',
    },
    estimatedWaitTime: { type: Number, default: 0 }, // minutes
  },
  { timestamps: true }
);

queueSchema.index({ clinicId: 1, doctorId: 1, date: 1, tokenNumber: 1 }, { unique: true });

export const Queue = model('Queue', queueSchema);
