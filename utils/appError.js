/**
 * Class to Handle Operational Errors in the project
 **/

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Errors created using this class is operational errors
    // These are predictable errors like user submitting invalid forms (errors generated from our own written code)
    this.isOperational = true;

    // This class is not added to the stack trace generated (prevent pollution to the stack trace)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
