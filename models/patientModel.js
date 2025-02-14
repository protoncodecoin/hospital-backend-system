const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  relPatient: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  medicalHistory: [{ type: String }],
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
