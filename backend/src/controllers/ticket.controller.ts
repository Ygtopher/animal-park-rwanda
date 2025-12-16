import { Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { AuthRequest } from '../middleware/auth.middleware';

const ticketService = new TicketService();

export class TicketController {
    async getTicket(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { reservationId } = req.params;

            const ticket = await ticketService.getTicket(
                reservationId,
                req.user?.userId
            );

            res.status(200).json({
                success: true,
                data: ticket,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async downloadTicket(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { reservationId } = req.params;

            const pdfBuffer = await ticketService.generateTicketPDF(reservationId);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=ticket-${reservationId}.pdf`
            );
            res.send(pdfBuffer);
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async scanTicket(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const { bookingReference } = req.body;

            if (!bookingReference) {
                res.status(400).json({
                    success: false,
                    error: 'Booking reference is required',
                });
                return;
            }

            const ticket = await ticketService.scanTicket(bookingReference, req.user.userId);

            res.status(200).json({
                success: true,
                data: ticket,
                numberOfVisitors: (ticket as any).reservation.numberOfVisitors,
                message: 'Ticket scanned successfully',
            });
        } catch (error: any) {
            console.error('Scan ticket error:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || 'Failed to scan ticket',
            });
        }
    }
}
