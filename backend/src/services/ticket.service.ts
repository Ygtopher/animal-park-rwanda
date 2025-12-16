import { ReservationRepository } from '../repositories/reservation.repository';
import { AppError } from '../middleware/error.middleware';
import { generateQRCode, generateQRCodeBuffer } from '../utils/qr-generator';
import { generateTicketPDF, TicketData } from '../utils/pdf-generator';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Ticket, ReservationStatus } from '@prisma/client';
import prisma from '../config/database';

export class TicketService {
    private reservationRepository: ReservationRepository;

    constructor() {
        this.reservationRepository = new ReservationRepository();
    }

    async generateTicket(reservationId: string): Promise<Ticket> {
        console.log(`🎫 Attempting to generate ticket for reservation: ${reservationId}`);

        const reservation = await this.reservationRepository.findById(reservationId);

        if (!reservation) {
            console.error(`❌ Reservation not found: ${reservationId}`);
            throw new AppError('Reservation not found', 404);
        }

        console.log(`📋 Reservation found. Status: ${reservation.status}`);

        if (reservation.status !== ReservationStatus.CONFIRMED) {
            console.error(`❌ Reservation not confirmed. Status: ${reservation.status}`);
            throw new AppError('Reservation must be confirmed to generate ticket', 400);
        }

        // Check if ticket already exists
        const existingTicket = await prisma.ticket.findUnique({
            where: { reservationId },
        });

        if (existingTicket) {
            console.log(`✅ Ticket already exists for reservation: ${reservationId}`);
            return existingTicket;
        }

        // Create ticket without QR code - using booking reference only
        console.log(`💾 Creating ticket in database...`);
        const ticket = await prisma.ticket.create({
            data: {
                reservation: { connect: { id: reservationId } },
                qrCode: reservation.bookingReference, // Use booking reference as qrCode for database compatibility
                validFrom: new Date(),
                validUntil: new Date(reservation.visitDate.getTime() + 24 * 60 * 60 * 1000), // Valid for 24 hours after visit date
            },
            include: {
                reservation: {
                    include: {
                        user: true,
                        park: true,
                    },
                },
            },
        });

        console.log(`✅ Ticket created successfully! ID: ${ticket.id}`);
        return ticket;
    }

    async getTicket(reservationId: string, userId?: string): Promise<Ticket> {
        const ticket = await prisma.ticket.findUnique({
            where: { reservationId },
            include: {
                reservation: {
                    include: {
                        user: true,
                        park: true,
                    },
                },
            },
        });

        if (!ticket) {
            throw new AppError('Ticket not found', 404);
        }

        // Verify ownership if userId provided
        if (userId && ticket.reservation.userId !== userId) {
            throw new AppError('Unauthorized access to ticket', 403);
        }

        return ticket;
    }

    async scanTicket(searchParam: string, scannedBy: string): Promise<Ticket> {
        // Find ticket by booking reference only
        const reservation = await prisma.reservation.findUnique({
            where: { bookingReference: searchParam },
            include: {
                ticket: {
                    include: {
                        reservation: {
                            include: {
                                user: true,
                                park: true,
                            },
                        },
                    },
                },
            },
        });

        if (!reservation || !reservation.ticket) {
            throw new AppError('Ticket not found for this booking reference', 404);
        }

        const ticket = reservation.ticket;

        // Validate ticket
        if (ticket.scanned) {
            throw new AppError('Ticket already scanned', 400);
        }

        const visitDate = new Date(ticket.reservation.visitDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (visitDate < today) {
            throw new AppError('Ticket has expired', 400);
        }

        // Mark ticket as scanned
        const scannedTicket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                scanned: true,
                scannedAt: new Date(),
                scannedBy,
            },
            include: {
                reservation: {
                    include: {
                        user: true,
                        park: true,
                    },
                },
            },
        });

        return scannedTicket;
    }

    async generateTicketPDF(reservationId: string): Promise<Buffer> {
        const ticket = await this.getTicket(reservationId);

        // @ts-ignore
        if (!ticket.reservation) {
            throw new AppError('Reservation data not found', 404);
        }

        const qrCodeBuffer = await generateQRCodeBuffer(ticket.qrCode);

        const ticketData: TicketData = {
            // @ts-ignore
            bookingReference: ticket.reservation.bookingReference,
            // @ts-ignore
            parkName: ticket.reservation.park.name,
            // @ts-ignore
            visitDate: formatDate(ticket.reservation.visitDate, 'PPP'),
            // @ts-ignore
            numberOfVisitors: ticket.reservation.numberOfVisitors,
            // @ts-ignore
            totalAmount: formatCurrency(Number(ticket.reservation.totalAmount)),
            qrCodeBuffer,
            // @ts-ignore
            visitorName: `${ticket.reservation.user.firstName} ${ticket.reservation.user.lastName}`,
        };

        return generateTicketPDF(ticketData);
    }
}
