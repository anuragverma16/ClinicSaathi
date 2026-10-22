import { Document, Schema, Types, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, Role } from '../utils/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
  clinicId?: Types.ObjectId;
  branchId?: Types.ObjectId;
  avatar?: string;
  isActive: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'PATIENT', index: true },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    avatar: String,
    isActive: { type: Boolean, default: true },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>('User', userSchema);
