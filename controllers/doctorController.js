const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsyncError');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Patient = require('../models/patientModel');
const DoctorNote = require('../models/doctorNotes');
const Doctor = require('../models/doctorModel');
const Reminder = require('../models/ReminderModel');
const callLLM = require('../utils/llmService');
const generateReminders = require('../utils/generateReminder');

const extractDuration = (text) => {
  const match = text.match(/\d+\s+(day|week|month)/);
  return match ? match[0] : '7 days'; // Default to 7 days if nothing is found
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
  const { userId, note } = req.body;

  // Find the doctor record associated with the logged-in user
  const doctor = await Doctor.findOne({ relDoctor: req.user.id });
  const patient = await Patient.findOne({ relPatient: userId });

  if (!doctor || !note || !patient) {
    return next(new AppError('Invalid request sent', 400));
  }

  if (
    !patient.assignedDoctor ||
    !patient.assignedDoctor._id.equals(doctor.relDoctor)
  ) {
    return next(
      new AppError(
        'You are not authorized to create a note for this patient',
        401,
      ),
    );
  }

  // generate actionable steps from AI
  const llmResponse = await callLLM(note);

  const transformedPlan = llmResponse.plan.map((task) => ({
    task: task,
    repeat: task.includes('daily') ? 'daily' : 'once', // Smarter detection
    duration: extractDuration(task), // Extract duration dynamically
  }));

  // Delete all old reminders related to the patient before saving new notes
  await Reminder.deleteMany({ patient: patient });

  // save the note and actionable steps
  const newNote = new DoctorNote({
    doctor: doctor._id,
    patient: patient._id,
    note: note,
    actionableSteps: {
      checklist: llmResponse.checklist,
      plan: transformedPlan,
    },
  });

  await newNote.save();

  // Generate reminders
  await generateReminders(newNote);

  res.status(200).json({
    status: 'sucess',
    data: { newNote },
  });
});

exports.getPatientNote = catchAsync(async (req, res, next) => {
  const userID = req.user.id;

  const doctorObj = await Doctor.findOne({ relDoctor: userID });

  const notes = await DoctorNote.find({ doctor: doctorObj.id })
    .select('-__v')
    .sort({ createdAt: -1 });

  const decryptedNotes = notes.map((note) => ({
    _id: note._id,
    doctor: note.doctor,
    note: note.getDecryptedNote(), // Decrypt before sending,
    createdAt: note.createdAt,
  }));

  res.status(200).json({
    status: 'success',
    results: decryptedNotes.length,
    data: { decryptedNotes },
  });
});
