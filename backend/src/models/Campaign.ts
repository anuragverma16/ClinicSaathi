import { Schema, model } from 'mongoose';
import { NOTIFICATION_CHANNELS } from '../utils/constants';

const campaignSchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    name: { type: String, required: true },
    channel: { type: String, enum: NOTIFICATION_CHANNELS, default: 'IN_APP' },
    message: { type: String, required: true },
    audience: { type: String, default: 'ALL_PATIENTS' },
    status: { type: String, enum: ['DRAFT', 'SCHEDULED', 'SENT'], default: 'DRAFT' },
    scheduledAt: Date,
    sentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Campaign = model('Campaign', campaignSchema);
