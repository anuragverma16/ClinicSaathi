import { Schema, model } from 'mongoose';
import { NOTIFICATION_CHANNELS } from '../utils/constants';

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    channel: { type: String, enum: NOTIFICATION_CHANNELS, default: 'IN_APP' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = model('Notification', notificationSchema);
