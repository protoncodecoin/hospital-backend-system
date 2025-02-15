const Reminder = require('../models/ReminderModel');

const sendNotification = async () => {
  try {
    // Get all pending reminders that are due
    const now = new Date();
    const reminders = await Reminder.find({
      dueDate: { $lte: now },
      status: 'pending',
    });

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
