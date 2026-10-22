import { Schema, model } from 'mongoose';

const doctorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    specialization: { type: String, required: true, index: true },
    qualification: String,
    consultationFee: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    // dayOfWeek: 0 (Sun) - 6 (Sat)
    availability: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6, required: true },
        start: { type: String, required: true },
        end: { type: String, required: true },
        slotDuration: { type: Number, default: 30 },
      },
    ],
    services: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Doctor = model('Doctor', doctorSchema);
