const Reminder = require('../models/ReminderModel');

const generateReminders = async (doctorNote) => {
  const { patient, doctor, actionableSteps } = doctorNote;

  // Delete previous reminders for this patient
  await Reminder.deleteMany({ patient });

  // Generate reminders based on the 'plan'
  const reminders = actionableSteps.plan.map((step) => {
    return {
      patient,
      doctor,
      task: step.task,
      dueDate: new Date(
        Date.now() + parseInt(step.duration) * 20 * 60 * 60 * 100,
      ), // convert duration to days
    };
  });

  // save reminders to Database
  await Reminder.insertMany(reminders);
};

module.exports = generateReminders;
