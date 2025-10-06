const nodemailer = require('nodemailer');

class NotificationService {
    constructor() {
        // Email transporter setup for Gmail
        this.emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_FROM || 'sastimeena@gmail.com',
                pass: process.env.EMAIL_PASSWORD 
            }
        });

        console.log('📧 Email notification service initialized');
    }

    // Email Template for Booking Confirmation
    getBookingConfirmationEmailHTML(booking, user, movie) {
        const showDateTime = new Date(booking.showDate).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const seatNumbers = booking.seats.map(seat => seat.seatNumber).join(', ');
        const totalSeats = booking.seats.length;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Booking Confirmation</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }
                .container { 
                    max-width: 600px; 
                    margin: 20px auto; 
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 40px 30px; 
                    text-align: center; 
                }
                .header h1 {
                    margin: 0 0 10px 0;
                    font-size: 32px;
                    font-weight: 300;
                }
                .header h2 {
                    margin: 0 0 10px 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                .header p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 16px;
                }
                .content { 
                    padding: 30px; 
                }
                .booking-card { 
                    background: #f8f9ff; 
                    padding: 30px; 
                    margin: 20px 0; 
                    border-radius: 15px; 
                    border-left: 5px solid #667eea;
                }
                .movie-title { 
                    font-size: 28px; 
                    color: #667eea; 
                    margin-bottom: 10px; 
                    font-weight: 700; 
                }
                .movie-info {
                    color: #666;
                    margin-bottom: 25px;
                    font-size: 16px;
                }
                .detail-row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin: 15px 0; 
                    padding: 12px 0; 
                    border-bottom: 1px solid #e8eaf6; 
                }
                .detail-row:last-of-type {
                    border-bottom: none;
                }
                .label { 
                    font-weight: 600; 
                    color: #555; 
                    font-size: 15px;
                }
                .value { 
                    color: #333; 
                    font-size: 15px;
                    text-align: right;
                }
                .amount { 
                    font-size: 24px; 
                    color: #28a745; 
                    font-weight: 700; 
                }
                .status-confirmed {
                    color: #28a745;
                    font-weight: 600;
                }
                .ticket-info {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 12px;
                    text-align: center;
                    margin: 25px 0;
                }
                .qr-placeholder { 
                    background: rgba(255,255,255,0.2); 
                    height: 120px; 
                    width: 120px; 
                    margin: 20px auto; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 15px;
                    border: 2px dashed rgba(255,255,255,0.5);
                }
                .instructions {
                    background: #fff3cd; 
                    border: 1px solid #ffeaa7; 
                    padding: 25px; 
                    border-radius: 12px; 
                    margin: 25px 0;
                }
                .instructions h3 {
                    margin-top: 0; 
                    color: #856404;
                    font-size: 18px;
                    margin-bottom: 15px;
                }
                .instructions ul {
                    color: #856404; 
                    margin: 0;
                    padding-left: 20px;
                }
                .instructions li {
                    margin-bottom: 8px;
                }
                .footer { 
                    text-align: center; 
                    padding: 30px; 
                    background: #f8f9fa;
                    color: #666; 
                    border-top: 1px solid #e9ecef;
                }
                .footer p {
                    margin: 5px 0;
                }
                .contact-info {
                    font-size: 14px; 
                    color: #999;
                    margin-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎬 CinemaBooking</h1>
                    <h2>Booking Confirmed!</h2>
                    <p>Your movie tickets are ready</p>
                </div>
                
                <div class="content">
                    <div class="booking-card">
                        <div class="movie-title">${movie.title}</div>
                        <div class="movie-info">${movie.genre.join(', ')} • ${movie.duration} mins • ${movie.rating.certification}</div>
                        
                        <div class="detail-row">
                            <span class="label">Booking ID</span>
                            <span class="value" style="font-weight: 700; color: #667eea;">${booking.bookingId}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Customer Name</span>
                            <span class="value">${user.name}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Show Date</span>
                            <span class="value">${showDateTime}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Show Time</span>
                            <span class="value">${booking.showTime}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Theatre</span>
                            <span class="value">${booking.theater.name}<br><small style="color: #666;">${booking.theater.location}</small></span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Seats (${totalSeats} ${totalSeats === 1 ? 'seat' : 'seats'})</span>
                            <span class="value">${seatNumbers}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Total Amount</span>
                            <span class="value amount">₹${booking.totalAmount}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Payment Status</span>
                            <span class="value status-confirmed">✅ ${booking.paymentStatus.toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <div class="ticket-info">
                        <h3 style="margin-top: 0; color: white;">🎫 Your Digital Ticket</h3>
                        <div class="qr-placeholder">
                            <span style="color: rgba(255,255,255,0.8); font-size: 14px;">QR CODE</span>
                        </div>
                        <p style="margin-bottom: 0; font-size: 14px; opacity: 0.9;">
                            Show this email or screenshot at the cinema entrance
                        </p>
                    </div>
                    
                    <div class="instructions">
                        <h3>📢 Important Instructions</h3>
                        <ul>
                            <li>Please arrive at least 15 minutes before showtime</li>
                            <li>Carry a valid photo ID proof for verification</li>
                            <li>Mobile phones must be switched to silent mode</li>
                            <li>Outside food and beverages are not permitted</li>
                            <li>Entry may be denied after the show begins</li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="font-size: 18px; margin-bottom: 15px;">Thank you for choosing CinemaBooking! 🍿</p>
                    <p>Enjoy your movie experience!</p>
                    <div class="contact-info">
                        <p>Need help? Contact us at sastimeena@gmail.com</p>
                        <p>Booking ID: <strong>${booking.bookingId}</strong> | Amount: <strong>₹${booking.totalAmount}</strong></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Send booking confirmation email
    async sendBookingConfirmationEmail(booking, user, movie) {
        try {
            console.log('📧 Sending booking confirmation email to:', user.email);
            console.log('🎬 Movie:', movie.title);
            console.log('🎫 Booking ID:', booking.bookingId);
            
            const mailOptions = {
                from: {
                    name: 'CinemaBooking 🎬',
                    address: process.env.EMAIL_FROM || 'sastimeena@gmail.com'
                },
                to: user.email,
                subject: `🎬 Booking Confirmed - ${movie.title} | ${booking.bookingId}`,
                html: this.getBookingConfirmationEmailHTML(booking, user, movie),
                // Plain text version for email clients that don't support HTML
                text: `
🎬 CINEMABOOKING - BOOKING CONFIRMED! 

Dear ${user.name},

Your booking has been confirmed! Here are your ticket details:

BOOKING DETAILS:
• Booking ID: ${booking.bookingId}
• Movie: ${movie.title}
• Date: ${new Date(booking.showDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
• Time: ${booking.showTime}
• Seats: ${booking.seats.map(s => s.seatNumber).join(', ')} (${booking.seats.length} seats)
• Theatre: ${booking.theater.name}, ${booking.theater.location}
• Total Amount: ₹${booking.totalAmount}
• Payment Status: ${booking.paymentStatus.toUpperCase()}

IMPORTANT INSTRUCTIONS:
- Arrive 15 minutes before showtime
- Carry valid ID proof
- Show this email at cinema entrance
- Mobile phones on silent mode
- No outside food/beverages allowed

Thank you for choosing CinemaBooking!
Enjoy your movie! 🍿

Need help? Reply to this email or contact sastimeena@gmail.com
                `
            };

            const result = await this.emailTransporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully!');
            console.log('📬 Message ID:', result.messageId);
            console.log('📧 Sent to:', user.email);
            
            return { 
                success: true, 
                messageId: result.messageId,
                email: user.email,
                bookingId: booking.bookingId
            };
        } catch (error) {
            console.error('❌ Email sending failed:');
            console.error('Error details:', error.message);
            console.error('User email:', user.email);
            console.error('Booking ID:', booking.bookingId);
            
            return { 
                success: false, 
                error: error.message,
                email: user.email,
                bookingId: booking.bookingId
            };
        }
    }

    // Send booking notifications (only email)
    async sendBookingNotifications(booking, user, movie) {
        console.log(`🔔 Sending email notification for booking ${booking.bookingId}`);
        console.log(`👤 Customer: ${user.name} (${user.email})`);
        console.log(`🎬 Movie: ${movie.title}`);
        console.log(`💺 Seats: ${booking.seats.length} seats`);
        console.log(`💰 Amount: ₹${booking.totalAmount}`);
        
        const emailResult = await this.sendBookingConfirmationEmail(booking, user, movie);
        
        console.log('📊 Notification completed:');
        console.log(`✅ Email: ${emailResult.success ? 'SENT' : 'FAILED'}`);
        
        if (!emailResult.success) {
            console.error('❌ Email error:', emailResult.error);
        }
        
        return {
            email: emailResult,
            summary: {
                success: emailResult.success,
                totalSent: emailResult.success ? 1 : 0,
                totalRequested: 1
            }
        };
    }

    // Test email configuration
    async testEmailConfiguration() {
        try {
            console.log('🔍 Testing email configuration...');
            await this.emailTransporter.verify();
            console.log('✅ Email configuration is valid');
            return { 
                success: true, 
                message: 'Email configuration verified successfully',
                service: 'Gmail',
                from: process.env.EMAIL_FROM || 'sastimeena@gmail.com'
            };
        } catch (error) {
            console.error('❌ Email configuration test failed:');
            console.error('Error:', error.message);
            return { 
                success: false, 
                error: error.message,
                service: 'Gmail',
                from: process.env.EMAIL_FROM || 'sastimeena@gmail.com'
            };
        }
    }

    // Send test email
    async sendTestEmail(userEmail = 'sastimeena@gmail.com') {
        try {
            const testMailOptions = {
                from: {
                    name: 'CinemaBooking 🎬',
                    address: process.env.EMAIL_FROM || 'sastimeena@gmail.com'
                },
                to: userEmail,
                subject: '🧪 CinemaBooking Email Test',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
                        <h1>🎬 CinemaBooking</h1>
                        <h2>Email Test Successful! ✅</h2>
                    </div>
                    <div style="padding: 20px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
                        <p>Your email notification system is working correctly!</p>
                        <p><strong>Test Details:</strong></p>
                        <ul>
                            <li>From: ${process.env.EMAIL_FROM || 'sastimeena@gmail.com'}</li>
                            <li>To: ${userEmail}</li>
                            <li>Time: ${new Date().toLocaleString('en-IN')}</li>
                        </ul>
                        <p>You're all set to receive booking confirmations! 🎫</p>
                    </div>
                </div>
                `,
                text: `
CinemaBooking Email Test

Your email notification system is working correctly!

Test Details:
- From: ${process.env.EMAIL_FROM || 'sastimeena@gmail.com'}
- To: ${userEmail}
- Time: ${new Date().toLocaleString('en-IN')}

You're all set to receive booking confirmations!
                `
            };

            const result = await this.emailTransporter.sendMail(testMailOptions);
            console.log('✅ Test email sent successfully:', result.messageId);
            
            return {
                success: true,
                messageId: result.messageId,
                to: userEmail
            };
        } catch (error) {
            console.error('❌ Test email failed:', error.message);
            return {
                success: false,
                error: error.message,
                to: userEmail
            };
        }
    }
}

module.exports = new NotificationService();