const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsyncError');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Patient = require('../models/patientModel');
const DoctorNote = require('../models/doctorNotes');
const Reminder = require('../models/ReminderModel');

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

exports.selectDoctor = catchAsync(async (req, res, next) => {
  const selectedDoctorId = req.params.id;
  const patient = await Patient.findOne({ relPatient: req.user.id }).populate(
    'assignedDoctor',
  );

  const doctor = await User.findById(selectedDoctorId);

  if (!doctor || !patient) {
    return next(new AppError('No doctor found with the given ID', 404));
  }

  // assign doctor to patient
  patient.assignedDoctor = doctor.id;
  await patient.save();

  res.status(200).json({
    status: 'success',
    message: 'Docter assigned successfully',
    data: {
      doctorId: patient.assignedDoctor._id,
    },
  });
});

exports.getNotes = catchAsync(async (req, res, next) => {
  const id = req.user.id;
  console.log('Logged-in user ID:', id);

  const patient = await Patient.findOne({ relPatient: id });

  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  const notes = await DoctorNote.find({ patient: patient._id })
    .select('doctor patient actionableSteps')
    .populate({ path: 'doctor', select: '_id' })
    .sort({ createdAt: -1 });

  console.log('Found Notes:', notes);

  res.status(200).json({
    status: 'success',
    results: notes.length,
    data: { notes },
  });
});

exports.checkIn = catchAsync(async (req, res, next) => {
  const { patientId, taskID } = req.body;

  const patient = await Patient.findOne({ relPatient: patientId });

  const reminder = await Reminder.findOne({
    _id: taskID,
    patient: patient._id,
  });
  if (!reminder) return next(new AppError('Reminder not found', 404));

  reminder.status = 'completed';
  await reminder.save();

  res.json({ status: 'success', message: 'Reminder marked as completed' });
});
