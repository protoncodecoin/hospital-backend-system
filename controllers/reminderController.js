const catchAsync = require('../utils/catchAsyncError');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Patient = require('../models/patientModel');
const DoctorNote = require('../models/doctorNotes');
const Doctor = require('../models/doctorModel');
const Reminder = require('../models/ReminderModel');

/**
 * Get all Reminders
 */
exports.getAllReminders = catchAsync(async (req, res, next) => {
  const reminders = await Reminder.find();

  res.status(200).json({
    status: 'success',
    result: reminders.length,
    data: {
      reminders,
    },
  });
});
