import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    console.error('VALIDATION ERROR:', err.issues);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  if (err?.code === 11000) {
    console.error('DUPLICATE KEY ERROR:', err.message);
    return res.status(409).json({ success: false, message: 'Duplicate value: record already exists' });
  }
  if (err?.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  console.error('API ERROR:', err);
  res.status(500).json({ success: false, message: 'Something went wrong' });
};
