import { Schema, model } from 'mongoose';

const branchSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: String,
    phone: String,
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Branch = model('Branch', branchSchema);
