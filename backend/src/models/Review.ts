import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    reply: String,
  },
  { timestamps: true }
);

export const Review = model('Review', reviewSchema);
