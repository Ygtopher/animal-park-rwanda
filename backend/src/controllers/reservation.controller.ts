import { Request, Response } from 'express';
import { ReservationService } from '../services/reservation.service';
import { AuthRequest } from '../middleware/auth.middleware';

const reservationService = new ReservationService();

export class ReservationController {
    async createReservation(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const reservation = await reservationService.createReservation(
                req.user.userId,
                req.body
            );

            res.status(201).json({
                success: true,
                data: reservation,
                message: 'Reservation created successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async getMyReservations(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const { status, upcoming } = req.query;

            const reservations = await reservationService.getUserReservations(
                req.user.userId,
                {
                    status: status as any,
                    upcoming: upcoming === 'true',
                }
            );

            res.status(200).json({
                success: true,
                data: reservations,
                count: reservations.length,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async getReservationById(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const { id } = req.params;

            const reservation = await reservationService.getReservationById(
                id,
                req.user.userId
            );

            res.status(200).json({
                success: true,
                data: reservation,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async getReservationByReference(req: Request, res: Response): Promise<void> {
        try {
            const { reference } = req.params;

            const reservation = await reservationService.getReservationByReference(reference);

            res.status(200).json({
                success: true,
                data: reservation,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async cancelReservation(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const { id } = req.params;

            const result = await reservationService.cancelReservation(id, req.user.userId);

            res.status(200).json({
                success: true,
                data: result,
                message: `Reservation cancelled. Refund amount: RWF ${result.refundAmount.toLocaleString()}`,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
