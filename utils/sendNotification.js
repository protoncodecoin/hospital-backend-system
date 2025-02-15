const mongoose = require('mongoose');
const Reminder = require('../models/ReminderModel');

const MONGO_URI = process.env.DATABASE_LOCAL;

// Establish MongoDB Connection
mongoose
  .connect(MONGO_URI, {})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Ensure Mongoose is Ready Before Running Cron Jobs
mongoose.connection.once('open', () => {
  console.log('🔄 Running Reminder Scheduler...');
});

const sendNotification = async () => {
  try {
    // Get all pending reminders that are due
    const now = new Date();
    console.log(now);
    const reminders = await Reminder.find({
      dueDate: { $lte: now },
      status: 'pending',
    });

    console.log('Found reminders: ', reminders);

    for (const reminder in reminders) {
      console.log(
        `Reminder for patient ${reminder.patient}: ${reminder.task} is due!`,
      );

      // Mark reminder as sent
      reminder.status = 'sent';
      await reminder.save();
    }

    console.log('Notification sent successfully');
  } catch (err) {
    console.error('Error sending notification: ', err);
  }
};

// Run function
sendNotification();

module.exports = sendNotification;
