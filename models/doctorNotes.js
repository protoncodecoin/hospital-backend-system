const mongoose = require('mongoose');

const doctorNoteSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    note: { type: String, required: true },
    actionableSteps: {
      checklist: [String],
      plan: [
        {
          task: String,
          repeat: String,
          duration: String,
        },
      ],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const DoctorNote = mongoose.model('DoctorNote', doctorNoteSchema);
module.exports = DoctorNote;
