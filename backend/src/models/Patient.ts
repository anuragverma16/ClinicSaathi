import { Schema, model } from 'mongoose';

const patientSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }, // set when patient has portal login
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    age: { type: Number, min: 1, max: 120 },
    dateOfBirth: Date,
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    bloodGroup: String,
    allergies: [String],
    address: String,
    emergencyContact: { name: String, phone: String, relation: String },
    medicalNotes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Patient = model('Patient', patientSchema);
