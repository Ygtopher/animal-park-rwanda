import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { ReservationStatus } from '@prisma/client';
import prisma from '../config/database';

const ticketService = new TicketService();

export class TicketUtilityController {
    /**
     * Generate tickets for all confirmed reservations that don't have tickets yet
     * This is a utility endpoint for fixing existing data
     */
    async generateMissingTickets(req: Request, res: Response): Promise<void> {
        try {
            // Find all confirmed reservations without tickets
            const reservationsWithoutTickets = await prisma.reservation.findMany({
                where: {
                    status: ReservationStatus.CONFIRMED,
                    ticket: null,
                },
                include: {
                    user: true,
                    park: true,
                },
            });

            console.log(`Found ${reservationsWithoutTickets.length} confirmed reservations without tickets`);

            const results = {
                total: reservationsWithoutTickets.length,
                success: 0,
                failed: 0,
                errors: [] as string[],
            };

            // Generate tickets for each reservation
            for (const reservation of reservationsWithoutTickets) {
                try {
                    await ticketService.generateTicket(reservation.id);
                    results.success++;
                    console.log(`✅ Generated ticket for reservation: ${reservation.bookingReference}`);
                } catch (error: any) {
                    results.failed++;
                    const errorMsg = `Failed for ${reservation.bookingReference}: ${error.message}`;
                    results.errors.push(errorMsg);
                    console.error(`❌ ${errorMsg}`);
                }
            }

            res.status(200).json({
                success: true,
                message: 'Ticket generation completed',
                data: results,
            });
        } catch (error: any) {
            console.error('Error generating missing tickets:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to generate tickets',
            });
        }
    }
}
