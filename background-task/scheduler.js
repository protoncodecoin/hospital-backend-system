const mongoose = require('mongoose');
const cron = require('node-cron');
const Reminder = require('../models/ReminderModel');
const sendNotification = require('../utils/sendNotification');

const MONGO_URI =
  process.env.DATABASE_LOCAL || 'mongodb://localhost:27017/hospital_db';

// Establish MongoDB Connection
mongoose
  .connect(MONGO_URI, {})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Ensure Mongoose is Ready Before Running Cron Jobs
mongoose.connection.once('open', () => {
  console.log('🔄 Running Reminder Scheduler...');

  // Run every minute to check for due reminders
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const reminders = await Reminder.find({
        status: 'pending',
        dueDate: { $lte: now },
      });

      for (const reminder of reminders) {
        await sendNotification(reminder.patient, reminder.task);
        console.log(`📩 Reminder sent to patient: ${reminder.patient}`);

        // ✅ Mark reminder as completed
        await Reminder.findByIdAndUpdate(reminder._id, { status: 'completed' });
      }
    } catch (error) {
      console.error('❌ Scheduler Error:', error);
    }
  });
});
