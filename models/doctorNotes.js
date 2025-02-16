const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

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

doctorNoteSchema.pre('save', function (next) {
  if (this.isModified('note')) {
    // AES encryption algorithm to encrypt note on save
    this.note = CryptoJS.AES.encrypt(this.note, ENCRYPTION_KEY).toString();
  }

  next();
});

// method to decrypt note before sending to the client
doctorNoteSchema.methods.getDecryptedNote = function () {
  const bytes = CryptoJS.AES.decrypt(this.note, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const DoctorNote = mongoose.model('DoctorNote', doctorNoteSchema);
module.exports = DoctorNote;
