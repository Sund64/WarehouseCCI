class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error untuk kebutuhan debugging internal
  console.error(`[ERROR] ${req.method} ${req.url} - ${message}`, err.stack);

  res.status(statusCode).json({
    status: 'fail',
    statusCode,
    message,
    // Sembunyikan stack trace di production
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { AppError, errorHandler };