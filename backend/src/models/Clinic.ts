import { Schema, model } from 'mongoose';

const clinicSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    address: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    logo: String,
    timezone: { type: String, default: 'Asia/Kolkata' },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      slotDuration: { type: Number, default: 30 },
      days: { type: [Number], default: [1, 2, 3, 4, 5, 6] },
    },
  },
  { timestamps: true }
);

export const Clinic = model('Clinic', clinicSchema);
