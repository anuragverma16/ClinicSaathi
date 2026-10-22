import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Clinic } from '../models/Clinic';
import { IUser, User } from '../models/User';
import { AppError } from '../utils/AppError';

export const signToken = (user: IUser): string =>
  jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });

export const publicUser = (u: IUser) => ({
  id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
  clinicId: u.clinicId, branchId: u.branchId, avatar: u.avatar,
});

export const registerOwner = async (input: {
  name: string; email: string; phone?: string; password: string; clinicName: string;
}) => {
  if (await User.exists({ email: input.email.toLowerCase() })) throw new AppError('Email already registered', 409);
  const clinic = await Clinic.create({ name: input.clinicName, email: input.email, phone: input.phone });
  const user = await User.create({
    name: input.name, email: input.email, phone: input.phone,
    password: input.password, role: 'CLINIC_OWNER', clinicId: clinic._id,
  });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Account is deactivated', 403);
  return user;
};

/** Returns the raw reset token (to be emailed). Only the hash is stored. */
export const createPasswordResetToken = async (email: string): Promise<string | null> => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  const raw = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(raw).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  return raw;
};

export const resetPassword = async (rawToken: string, password: string) => {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hash, passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');
  if (!user) throw new AppError('Reset token is invalid or has expired', 400);
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return user;
};
