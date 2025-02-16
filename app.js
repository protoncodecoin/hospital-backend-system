const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const doctorRouter = require('./routes/doctorRouter');
const userRouter = require('./routes/userRouter');
const reminderRouter = require('./routes/reminderRouter');
const patientRouter = require('./routes/patientRouter');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/doctors', doctorRouter);
app.use('/api/v1/patients', patientRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reminders', reminderRouter);

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// Global Error Handling middleware
app.use(globalErrorHandler);

module.exports = app;
