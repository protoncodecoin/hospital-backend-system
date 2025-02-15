const cron = require('node-cron');

const Reminder = require('../models/ReminderModel');
const sendNotification = require('../utils/sendNotification');

cron.schedule('* * * * *', async () => {
  try {
    console.log('Cron job is running every minute...');

    const now = new Date();

    const reminders = await Reminder.find({
      status: 'pending',
      dueDate: { $lte: now },
    });
    console.log('The results for pending reminders: ', reminders);

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
