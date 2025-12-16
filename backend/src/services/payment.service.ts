import { PaymentRepository } from '../repositories/payment.repository';
import { ReservationRepository } from '../repositories/reservation.repository';
import { EmailService } from './email.service';
import { TicketService } from './ticket.service';
import { AppError } from '../middleware/error.middleware';
import { Payment, PaymentMethod, PaymentStatus, ReservationStatus } from '@prisma/client';

export class PaymentService {
    private paymentRepository: PaymentRepository;
    private reservationRepository: ReservationRepository;
    private emailService: EmailService;
    private ticketService: TicketService;

    constructor() {
        this.paymentRepository = new PaymentRepository();
        this.reservationRepository = new ReservationRepository();
        this.emailService = new EmailService();
        this.ticketService = new TicketService();
    }

    async initiatePayment(data: {
        reservationId: string;
        method: PaymentMethod;
        phoneNumber?: string;
    }): Promise<{
        payment: Payment;
        paymentUrl?: string;
        instructions?: string;
    }> {
        // Get reservation
        const reservation = await this.reservationRepository.findById(data.reservationId);

        if (!reservation) {
            throw new AppError('Reservation not found', 404);
        }

        if (reservation.status !== ReservationStatus.PENDING) {
            throw new AppError('Reservation is not pending payment', 400);
        }

        // Check if payment already exists
        const existingPayment = await this.paymentRepository.findByReservationId(
            data.reservationId
        );

        if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
            throw new AppError('Payment already completed for this reservation', 400);
        }

        // Generate transaction ID
        const transactionId = this.generateTransactionId();

        // Create payment record
        const payment = await this.paymentRepository.create({
            reservationId: data.reservationId,
            amount: Number(reservation.totalAmount),
            method: data.method,
            transactionId,
        });

        // Process payment based on method
        let paymentUrl: string | undefined;
        let instructions: string | undefined;

        switch (data.method) {
            case PaymentMethod.MOBILE_MONEY_MTN:
                instructions = await this.processMTNMobileMoney(
                    payment,
                    data.phoneNumber!,
                    Number(reservation.totalAmount)
                );
                break;

            case PaymentMethod.MOBILE_MONEY_AIRTEL:
                instructions = await this.processAirtelMoney(
                    payment,
                    data.phoneNumber!,
                    Number(reservation.totalAmount)
                );
                break;

            case PaymentMethod.CARD:
                paymentUrl = await this.processCardPayment(payment, Number(reservation.totalAmount));
                break;

            case PaymentMethod.BANK_TRANSFER:
                instructions = this.getBankTransferInstructions(payment);
                break;
        }

        return {
            payment,
            paymentUrl,
            instructions,
        };
    }

    async verifyPayment(transactionId: string): Promise<Payment> {
        const payment = await this.paymentRepository.findByTransactionId(transactionId);

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        // In production, verify with payment gateway
        // For now, we'll simulate verification

        return payment;
    }

    async completePayment(transactionId: string): Promise<Payment> {
        const payment = await this.paymentRepository.findByTransactionId(transactionId);

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            throw new AppError('Payment already completed', 400);
        }

        // Update payment status
        const updatedPayment = await this.paymentRepository.updateStatus(
            payment.id,
            PaymentStatus.COMPLETED,
            new Date()
        );

        // Update reservation status
        await this.reservationRepository.updateStatus(
            payment.reservationId,
            ReservationStatus.CONFIRMED
        );

        // Generate ticket for the reservation
        try {
            await this.ticketService.generateTicket(payment.reservationId);
            console.log(`✅ Ticket generated for reservation ${payment.reservationId}`);
        } catch (error) {
            console.error('❌ Failed to generate ticket:', error);
            // Don't fail the payment if ticket generation fails
        }

        return updatedPayment;
    }

    /**
     * Simulate payment processing for development/testing
     * Auto-approves after 2 seconds and sends ticket email
     * Amounts ending in 99 will fail for testing
     */
    async simulatePayment(transactionId: string): Promise<{
        success: boolean;
        payment: Payment;
        message: string;
    }> {
        const payment = await this.paymentRepository.findByTransactionId(transactionId);

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            throw new AppError('Payment already completed', 400);
        }

        // Get reservation with user and park details
        const reservation = await this.reservationRepository.findById(payment.reservationId);
        if (!reservation) {
            throw new AppError('Reservation not found', 404);
        }

        // Type assertion to ensure user and park are included
        const reservationData = reservation as any;
        if (!reservationData.user || !reservationData.park) {
            throw new AppError('Reservation data incomplete', 500);
        }

        // Simulate processing delay (2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Test failure: amounts ending in 99 fail
        const amount = Number(payment.amount);
        if (amount % 100 === 99) {
            await this.paymentRepository.updateStatus(
                payment.id,
                PaymentStatus.FAILED
            );
            return {
                success: false,
                payment: await this.paymentRepository.findById(payment.id) as Payment,
                message: 'Payment simulation failed (test amount ending in 99)',
            };
        }

        // Complete the payment
        const completedPayment = await this.completePayment(transactionId);

        // Send ticket email to tourist
        try {
            const qrData = JSON.stringify({
                bookingReference: reservation.bookingReference,
                parkId: reservation.parkId,
                visitDate: reservation.visitDate.toISOString(),
                numberOfVisitors: reservation.numberOfVisitors,
            });

            // Type cast to access included relations
            const reservationWithRelations = reservation as any;

            await this.emailService.sendTicketEmail({
                to: reservationWithRelations.user.email,
                touristName: `${reservationWithRelations.user.firstName} ${reservationWithRelations.user.lastName}`,
                bookingReference: reservation.bookingReference,
                parkName: reservationWithRelations.park.name,
                visitDate: reservation.visitDate,
                numberOfVisitors: reservation.numberOfVisitors,
                totalAmount: Number(reservation.totalAmount),
                qrData,
            });

            console.log(`✅ Ticket email sent to ${reservationWithRelations.user.email}`);
        } catch (emailError) {
            console.error('❌ Failed to send ticket email:', emailError);
            // Don't fail the payment if email fails
        }

        return {
            success: true,
            payment: completedPayment,
            message: 'Payment processed successfully. Ticket sent to email.',
        };
    }

    async handlePaymentWebhook(data: any): Promise<void> {
        // Handle webhook from payment provider
        // This would be implemented based on specific provider requirements
        const { transactionId, status } = data;

        if (status === 'success') {
            await this.completePayment(transactionId);
        } else if (status === 'failed') {
            const payment = await this.paymentRepository.findByTransactionId(transactionId);
            if (payment) {
                await this.paymentRepository.updateStatus(payment.id, PaymentStatus.FAILED);
            }
        }
    }

    private generateTransactionId(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `TXN-${timestamp}-${random}`;
    }

    private async processMTNMobileMoney(
        payment: Payment,
        phoneNumber: string,
        amount: number
    ): Promise<string> {
        // In production, integrate with MTN Mobile Money API
        // For now, return mock instructions

        return `
      MTN Mobile Money Payment Instructions:
      
      1. Dial *182*7*1#
      2. Enter amount: ${amount.toLocaleString()} RWF
      3. Enter merchant code: 123456
      4. Enter reference: ${payment.transactionId}
      5. Enter your PIN to confirm
      
      Or wait for the payment prompt on your phone.
    `;
    }

    private async processAirtelMoney(
        payment: Payment,
        phoneNumber: string,
        amount: number
    ): Promise<string> {
        // In production, integrate with Airtel Money API
        // For now, return mock instructions

        return `
      Airtel Money Payment Instructions:
      
      1. Dial *500*1#
      2. Select "Make Payment"
      3. Enter amount: ${amount.toLocaleString()} RWF
      4. Enter merchant code: 654321
      5. Enter reference: ${payment.transactionId}
      6. Enter your PIN to confirm
      
      Or wait for the payment prompt on your phone.
    `;
    }

    private async processCardPayment(payment: Payment, amount: number): Promise<string> {
        // In production, integrate with card payment gateway (Stripe, Flutterwave, etc.)
        // For now, return mock URL

        return `https://payment-gateway.example.com/pay/${payment.transactionId}`;
    }

    private getBankTransferInstructions(payment: Payment): string {
        return `
      Bank Transfer Instructions:
      
      Bank: Bank of Kigali
      Account Name: Animal Park Rwanda
      Account Number: 1234567890
      Swift Code: BKIGRWRW
      Reference: ${payment.transactionId}
      
      Please include the reference number in your transfer.
    `;
    }
}
