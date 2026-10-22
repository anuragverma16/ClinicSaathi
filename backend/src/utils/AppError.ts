export class AppError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
