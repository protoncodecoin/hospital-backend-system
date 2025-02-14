const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  relDoctor: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  specialization: {
    enum: [
      'Cardiology',
      'Neurology',
      'Cardiology',
      'Dermatology',
      'General Medicine',
    ],
  },
  patients: [{ type: mongoose.Types.ObjectId, ref: 'Patient' }],
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
