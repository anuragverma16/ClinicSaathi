import { Schema, model } from 'mongoose';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../utils/constants';

const paymentSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'PAID' },
    transactionId: String,
    receiptNumber: String,
  },
  { timestamps: true }
);

export const Payment = model('Payment', paymentSchema);
