const sgMail = require('@sendgrid/mail');

class NotificationService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('📧 SendGrid email notification service initialized');
  }

  getBookingConfirmationEmailHTML(booking, user, movie) {
    // You can reuse your existing HTML template here
    return `
      <html>
        <body>
          <h1>Booking Confirmed - ${movie.title}</h1>
          <p>Thankyou for booking with Sastika'smovies.com</p>
          <p>Booking ID: ${booking.bookingId}</p>
          <p>Show Date: ${booking.showDate}</p>
          <p>Show Time: ${booking.showTime}</p>
          <p>Seats: ${booking.seats.map(s => s.seatNumber).join(', ')}</p>
          <p>Amount Paid: ₹${booking.totalAmount}</p>
        </body>
      </html>
    `;
  }

  async sendBookingConfirmationEmail(booking, user, movie) {
    try {
      const msg = {
        to: user.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `Booking Confirmed - ${movie.title} | ${booking.bookingId}`,
        text: `Your booking with ID ${booking.bookingId} was successful.`,
        html: this.getBookingConfirmationEmailHTML(booking, user, movie),
      };

      const response = await sgMail.send(msg);
      console.log('✅ Email sent successfully via SendGrid to', user.email);
      return { success: true, response };
    } catch (error) {
      console.error('❌ SendGrid email failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBookingNotifications(booking, user, movie) {
    console.log(`🔔 Sending email notification for booking ${booking.bookingId}`);
    const emailResult = await this.sendBookingConfirmationEmail(booking, user, movie);
    return {
      email: emailResult,
      summary: { success: emailResult.success, totalSent: emailResult.success ? 1 : 0, totalRequested: 1 }
    };
  }
}

module.exports = new NotificationService();
