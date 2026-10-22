import { Response } from 'express';

export const sendSuccess = <T>(res: Response, message: string, data?: T, status = 200) =>
  res.status(status).json({ success: true, message, data });
