const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  task: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  dueDate: { type: Date, required: true },
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
