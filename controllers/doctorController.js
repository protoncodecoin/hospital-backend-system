const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsyncError');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');

exports.getAllPatients = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const patients = await features.query;

  res.status(200).json({
    status: 'success',
    results: patients.length,
    data: {
      data: patients,
    },
  });
});

exports.getAssignedPatients = catchAsync(async (req, res, next) => {
  // const features = new APIFeatures(User.find(), req.query)
  res.status(200).json({
    status: 'success',
    results: 12,
    data: {
      data: [],
    },
  });
});

exports.getPatient = catchAsync(async (req, res, next) => {
  const patientId = req.params.id;
  const patient = await User.findById(patientId);

  if (!patient) {
    return next(new AppError('No Patient with that ID', 404));
  }

  res.status(200).json({
    status: 'sucess',
    data: {
      patient,
    },
  });
});
