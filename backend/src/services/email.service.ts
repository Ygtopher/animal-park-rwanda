import QRCode from 'qrcode';

export class EmailService {
    private transporter: any = null;

    constructor() {
        try {
            const nodemailerModule = require('nodemailer');
            const nodemailer = nodemailerModule.default || nodemailerModule;

            this.transporter = nodemailer.createTransporter({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: Number(process.env.EMAIL_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
            console.log('✅ Email service initialized');
        } catch (error) {
            console.warn('⚠️  Email service disabled - nodemailer not available');
            console.warn('   Payment simulation will work, but emails will not be sent');
        }
    }

    async sendTicketEmail(data: {
        to: string;
        touristName: string;
        bookingReference: string;
        parkName: string;
        visitDate: Date;
        numberOfVisitors: number;
        totalAmount: number;
        qrData: string;
    }): Promise<void> {
        if (!this.transporter) {
            console.log('📧 Email skipped (service disabled) - Ticket for:', data.to);
            return;
        }

        try {
            // Generate QR code as base64
            const qrCodeDataURL = await QRCode.toDataURL(data.qrData, {
                width: 300,
                margin: 2,
            });

            const html = this.getTicketEmailTemplate(data, qrCodeDataURL);

            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Animal Park Rwanda" <noreply@animalpark.rw>',
                to: data.to,
                subject: `Your Animal Park Ticket - ${data.bookingReference}`,
                html,
            });

            console.log(`✅ Ticket email sent to ${data.to}`);
        } catch (error) {
            console.error('❌ Error sending ticket email:', error);
            throw error;
        }
    }

    async sendPaymentConfirmation(data: {
        to: string;
        touristName: string;
        bookingReference: string;
        amount: number;
        transactionId: string;
    }): Promise<void> {
        if (!this.transporter) {
            console.log('📧 Email skipped (service disabled) - Payment confirmation for:', data.to);
            return;
        }

        try {
            const html = this.getPaymentConfirmationTemplate(data);

            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Animal Park Rwanda" <noreply@animalpark.rw>',
                to: data.to,
                subject: `Payment Confirmation - ${data.bookingReference}`,
                html,
            });

            console.log(`✅ Payment confirmation sent to ${data.to}`);
        } catch (error) {
            console.error('❌ Error sending payment confirmation:', error);
            throw error;
        }
    }

    private getTicketEmailTemplate(
        data: {
            touristName: string;
            bookingReference: string;
            parkName: string;
            visitDate: Date;
            numberOfVisitors: number;
            totalAmount: number;
        },
        qrCodeDataURL: string
    ): string {
        const visitDateFormatted = new Date(data.visitDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Animal Park Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🦁 Animal Park Rwanda</h1>
                            <p style="color: #e8f5e9; margin: 10px 0 0 0; font-size: 16px;">Your Ticket is Ready!</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d5016; margin: 0 0 20px 0;">Hello ${data.touristName}! 👋</h2>
                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Thank you for booking with Animal Park Rwanda! Your payment has been confirmed and your ticket is ready.
                            </p>
                            
                            <!-- Booking Details -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                <tr>
                                    <td>
                                        <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">📋 Booking Details</h3>
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #777; font-size: 14px; border-bottom: 1px solid #e0e0e0;"><strong>Booking Reference:</strong></td>
                                                <td style="color: #333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;"><strong>${data.bookingReference}</strong></td>
                                            </tr>
                                            <tr>
                                                <td style="color: #777; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Park:</td>
                                                <td style="color: #333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">${data.parkName}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #777; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Visit Date:</td>
                                                <td style="color: #333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">${visitDateFormatted}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #777; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Number of Visitors:</td>
                                                <td style="color: #333; font-size: 14px; text-align: right; border-bottom: 1px solid #e0e0e0;">${data.numberOfVisitors}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #777; font-size: 14px;"><strong>Total Amount:</strong></td>
                                                <td style="color: #2d5016; font-size: 16px; text-align: right;"><strong>${data.totalAmount.toLocaleString()} RWF</strong></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- QR Code -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <h3 style="color: #2d5016; margin: 0 0 15px 0; font-size: 18px;">📱 Your Ticket QR Code</h3>
                                        <p style="color: #777; font-size: 14px; margin: 0 0 15px 0;">Present this QR code at the park entrance</p>
                                        <img src="${qrCodeDataURL}" alt="Ticket QR Code" style="width: 250px; height: 250px; border: 2px solid #2d5016; border-radius: 8px; padding: 10px; background-color: #ffffff;" />
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Important Information -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <tr>
                                    <td>
                                        <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                                            <strong>⚠️ Important:</strong><br>
                                            • Please arrive 15 minutes before your scheduled visit<br>
                                            • Bring a valid ID for verification<br>
                                            • This ticket is valid only for the date specified above<br>
                                            • Keep this email for your records
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                We look forward to welcoming you to ${data.parkName}! If you have any questions, please don't hesitate to contact us.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #777; font-size: 12px; margin: 0; line-height: 1.6;">
                                Animal Park Rwanda<br>
                                Kigali, Rwanda<br>
                                Email: info@animalpark.rw | Phone: +250 788 123 456
                            </p>
                            <p style="color: #999; font-size: 11px; margin: 15px 0 0 0;">
                                © 2024 Animal Park Rwanda. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    private getPaymentConfirmationTemplate(data: {
        touristName: string;
        bookingReference: string;
        amount: number;
        transactionId: string;
    }): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Payment Confirmed</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #2d5016; margin: 0 0 20px 0;">Hello ${data.touristName}!</h2>
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                                Your payment has been successfully processed. Your ticket will be sent in a separate email.
                            </p>
                            <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; margin: 20px 0;">
                                <tr>
                                    <td style="color: #777;">Booking Reference:</td>
                                    <td style="color: #333; text-align: right;"><strong>${data.bookingReference}</strong></td>
                                </tr>
                                <tr>
                                    <td style="color: #777;">Transaction ID:</td>
                                    <td style="color: #333; text-align: right;">${data.transactionId}</td>
                                </tr>
                                <tr>
                                    <td style="color: #777;"><strong>Amount Paid:</strong></td>
                                    <td style="color: #2d5016; text-align: right; font-size: 18px;"><strong>${data.amount.toLocaleString()} RWF</strong></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
                            <p style="color: #777; font-size: 12px; margin: 0;">
                                © 2024 Animal Park Rwanda. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }
}
