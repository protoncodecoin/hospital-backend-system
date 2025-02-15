const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsyncError');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Patient = require('../models/patientModel');
const DoctorNote = require('../models/doctorNotes');
const Doctor = require('../models/doctorModel');
const callLLM = require('../utils/llmService');

const extractDuration = (text) => {
  const match = text.match(/\d+\s+(day|week|month)/);
  return match ? match[0] : "7 days"; // Default to 7 days if nothing is found
};




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

  // Find the doctor record associated with the logged-in user
  const doctor = await Doctor.findOne({ relDoctor: req.user.id });

  if (!doctor || !note) {
    return next(new AppError('Doctor profile not found', 404));
  }

 
  // generate actionable steps from AI
  const llmResponse = await callLLM(note);

  const transformedPlan = llmResponse.plan.map((task) => ({
    task: task,
    repeat: task.includes("daily") ? "daily" : "once", // Smarter detection
    duration: extractDuration(task) // Extract duration dynamically
  }));

  // save the note and actionable steps
    const newNote = new DoctorNote({
    doctor: doctor._id,
    patient: patientID,
    note: note,
    actionableSteps: {
      checklist: llmResponse.checklist,
      plan: transformedPlan
    }
  });

  await newNote.save();


  res.status(200).json({
    status: 'sucess',
    data: { newNote },
  });
});

exports.getPatientNote = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

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
