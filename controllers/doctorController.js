const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsyncError');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Patient = require('../models/patientModel');
const DoctorNote = require('../models/doctorNotes');
const Doctor = require('../models/doctorModel');

exports.getAllDoctors = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doctors = await features.query;

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    data: {
      data: doctors,
    },
  });
});

exports.getAssignedPatients = catchAsync(async (req, res, next) => {
  const doctorId = req.user.id;

  const patients = await Patient.find({ assignedDoctor: doctorId })
    .populate({
      path: 'relPatient',
      select: '-__v -specialization',
    })
    .select('-__v');

  res.status(200).json({
    status: 'success',
    results: patients.length,
    data: {
      data: patients,
    },
  });
});

exports.submitNote = catchAsync(async (req, res, next) => {
  const { patientID, note } = req.body;

  // 1. Find the doctor record associated with the logged-in user
  const doctor = await Doctor.findOne({ relDoctor: req.user.id });

  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }
  console.log(doctor);
  console.log(patientID);

  // create a new note
  const newNote = await DoctorNote.create({
    doctor: doctor._id, // Use the actual doctor ID, not the user ID
    patient: patientID,
    note: note,
  });

  res.status(200).json({
    status: 'sucess',
    data: { newNote },
  });
});

exports.getPatientNote = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  console.log(userID);

  const doctor = await Doctor.findOne({ relDoctor: userID });

  const notes = await DoctorNote.find({ doctor: doctor.id })
    .select('-__v')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: notes.length,
    data: { notes },
  });
});
