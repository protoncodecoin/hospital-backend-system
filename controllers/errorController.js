const AppError = require('../utils/appError');

/**
 * Handles cast errors thrown by mongodb
 * @param {object} err
 * @returns AppError() oerror object marked as operational
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handle Duplicate Key errors thrown by mongodb
 * @param {object} err
 * @returns AppError() error object marked as operational
 */
const handleDuplicateFieldsDb = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

/**
 * Handle validation errors thrown by mongodb
 * @param {object} err
 * @returns AppError() error object marked as operational
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
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
  // Operational error that is handled and trusted
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming oer other unknown error: Prevent leaking of sensitive information
  } else {
    console.log('ERROR: ', err);

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: err,
    });
  }
};

/*
 * Handle errors
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.errorResponse?.code === 11000)
      error = handleDuplicateFieldsDb(error);
    if (err._message.includes('validation'))
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
