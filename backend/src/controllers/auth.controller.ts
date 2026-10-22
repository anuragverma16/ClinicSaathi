import { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env';
import { User } from '../models/User';
import * as auth from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { forgotSchema, loginSchema, registerSchema, resetSchema } from '../validators/auth.validator';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await auth.registerOwner(registerSchema.parse(req.body));
  const token = auth.signToken(user);
  res.cookie('token', token, cookieOptions);
  sendSuccess(res, 'Registration successful', { token, user: auth.publicUser(user) }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await auth.loginUser(email, password);
  const token = auth.signToken(user);
  res.cookie('token', token, cookieOptions);
  sendSuccess(res, 'Login successful', { token, user: auth.publicUser(user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('token', cookieOptions);
  sendSuccess(res, 'Logged out successfully');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, 'Current user', auth.publicUser(user));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotSchema.parse(req.body);
  const token = await auth.createPasswordResetToken(email);
  // TODO: send via email provider. In development the token is returned for testing only.
  const data = env.NODE_ENV !== 'production' && token ? { resetToken: token } : undefined;
  sendSuccess(res, 'If the email exists, a reset link has been sent', data);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = resetSchema.parse(req.body);
  await auth.resetPassword(token, password);
  sendSuccess(res, 'Password reset successful');
});
