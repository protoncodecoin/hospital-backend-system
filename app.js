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
  console.log(process.env.NODE_ENV, "============");
  app.use(morgan('dev'));
}

app.use('/api/v1/doctors', doctorRouter);
app.use('/api/v1/users', userRouter);

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// Global Error Handling middleware
app.use(globalErrorHandler);

module.exports = app;
