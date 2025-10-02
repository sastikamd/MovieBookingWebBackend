const cron = require('node-cron');
const Booking = require('../models/Booking');
const { sendEmail, sendSMS } = require('./notifications');

// Runs every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  const now = new Date();
  const reminderTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead
  
  const bookings = await Booking.find({
    showDate: reminderTime.toISOString().slice(0,10),
    showTime: reminderTime.toTimeString().slice(0,5)
  }).populate('user');
  
  for (const b of bookings) {
    const message = `Reminder: Your movie ${b.movieTitle} starts in 1 hour at ${b.showTime}. Enjoy!`;
    sendEmail(b.user.email, 'Showtime Reminder', `<p>${message}</p>`).catch(console.error);
    sendSMS(b.user.phone, message).catch(console.error);
  }
});
