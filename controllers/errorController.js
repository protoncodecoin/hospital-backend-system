const AppError = require('../utils/appError');

const handleJWTError = () =>
  new AppError('Invalid token. Please login again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again', 401);

/**
 * Handle validation errors thrown by mongodb and marks error as operational
 * @param {object} err
 * @returns instance of AppError error object marked as operational
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle casting errors from mongodb and mark it as operational
 * @param {object} err
 * @returns instance of AppError()
 */
const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle duplicate key errors from mongodb drive and mark it as operational
 * @param {object} err
 * @returns instance of AppError()
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational errors (handled errors)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming error or unhandled error (Prevent leaking of sensitive data)
  } else {
    console.log('😒', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') {
      return sendErrorProd(handleCastErrorDb(err), res);
    } else if (err.code === 11000) {
      return sendErrorProd(handleDuplicateFieldsDB(err), res);
    } else if (err.name === 'ValidationError') {
      return sendErrorProd(handleValidationErrorDB(err), res);
    } else if (err.name === 'JsonWebTokenError') {
      return sendErrorProd(handleJWTError(), res);
    } else if (err.name === 'TokenExpiredError') {
      return sendErrorProd(handleJWTExpiredError(), res);
    } else if (err.message.toLowerCase().includes('specialization')) {
      sendErrorProd(err, res);
    } else {
      sendErrorProd(err, res);
    }
  }
};
