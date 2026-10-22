import { Schema, model } from 'mongoose';

const prescriptionSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    diagnosis: { type: String, required: true },
    symptoms: [String],
    medicines: [{ name: String, dosage: String, frequency: String, duration: String }],
    instructions: String,
    followUpDate: Date,
    documentUrl: String,
  },
  { timestamps: true }
);

export const Prescription = model('Prescription', prescriptionSchema);
