import { Schema, model } from 'mongoose';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../utils/constants';

const invoiceSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    invoiceNumber: { type: String, unique: true, sparse: true },
    items: [{ description: String, quantity: { type: Number, default: 1 }, price: Number }],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'PENDING', index: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS },
    paidAt: Date,
  },
  { timestamps: true }
);

export const Invoice = model('Invoice', invoiceSchema);
