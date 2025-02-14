const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const doctorRouter = require('./routes/doctorRouter');
const userRouter = require('./routes/userRouter');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/doctors', doctorRouter);
app.use('/api/v1/users', userRouter);

// Handling unhandled routes
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 400;

  // next(err);
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// Global Error Handling middleware
app.use(globalErrorHandler);

module.exports = app;
