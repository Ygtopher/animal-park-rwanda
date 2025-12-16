import { ReservationRepository } from '../repositories/reservation.repository';
import { ParkRepository } from '../repositories/park.repository';
import { AppError } from '../middleware/error.middleware';
import { generateBookingReference, calculateRefundAmount } from '../utils/helpers';
import { Reservation, ReservationStatus, VisitorType } from '@prisma/client';
import prisma from '../config/database';

export class ReservationService {
    private reservationRepository: ReservationRepository;
    private parkRepository: ParkRepository;

    constructor() {
        this.reservationRepository = new ReservationRepository();
        this.parkRepository = new ParkRepository();
    }

    async createReservation(
        userId: string,
        data: {
            parkId: string;
            visitDate: Date;
            numberOfVisitors: number;
            visitorType?: VisitorType;
            specialRequests?: string;
        }
    ): Promise<Reservation> {
        // Validate park exists
        const park = await this.parkRepository.findById(data.parkId);
        if (!park) {
            throw new AppError('Park not found', 404);
        }

        // Check if park is active
        if (park.status !== 'ACTIVE') {
            throw new AppError('Park is not currently accepting reservations', 400);
        }

        // Check availability
        const visitDate = new Date(data.visitDate);
        visitDate.setHours(0, 0, 0, 0);

        const availability = await this.parkRepository.checkAvailability(
            data.parkId,
            visitDate
        );

        if (!availability.available || availability.availableSlots < data.numberOfVisitors) {
            throw new AppError(
                `Insufficient availability. Only ${availability.availableSlots} slots available`,
                400
            );
        }

        // Calculate price
        const totalAmount = await this.calculatePrice(
            data.parkId,
            data.visitorType || VisitorType.FOREIGN_ADULT,
            data.numberOfVisitors
        );

        // Generate booking reference
        const bookingReference = generateBookingReference();

        // Create reservation
        const reservation = await this.reservationRepository.create({
            user: { connect: { id: userId } },
            park: { connect: { id: data.parkId } },
            visitDate,
            numberOfVisitors: data.numberOfVisitors,
            totalAmount,
            bookingReference,
            specialRequests: data.specialRequests,
            status: ReservationStatus.PENDING,
        });

        // Update park schedule
        await this.updateParkSchedule(data.parkId, visitDate, data.numberOfVisitors);

        return reservation;
    }

    async getReservationById(id: string, userId?: string): Promise<Reservation> {
        const reservation = await this.reservationRepository.findById(id);

        if (!reservation) {
            throw new AppError('Reservation not found', 404);
        }

        // If userId provided, ensure user owns the reservation or is admin
        if (userId && reservation.userId !== userId) {
            throw new AppError('Unauthorized access to reservation', 403);
        }

        return reservation;
    }

    async getReservationByReference(bookingReference: string): Promise<Reservation> {
        const reservation = await this.reservationRepository.findByBookingReference(
            bookingReference
        );

        if (!reservation) {
            throw new AppError('Reservation not found', 404);
        }

        return reservation;
    }

    async getUserReservations(
        userId: string,
        filters?: {
            status?: ReservationStatus;
            upcoming?: boolean;
        }
    ): Promise<Reservation[]> {
        return this.reservationRepository.findByUserId(userId, filters);
    }

    async cancelReservation(id: string, userId: string): Promise<{
        reservation: Reservation;
        refundAmount: number;
    }> {
        const reservation = await this.getReservationById(id, userId);

        if (reservation.status === ReservationStatus.CANCELLED) {
            throw new AppError('Reservation is already cancelled', 400);
        }

        if (reservation.status === ReservationStatus.COMPLETED) {
            throw new AppError('Cannot cancel completed reservation', 400);
        }

        // Calculate refund
        const refundAmount = calculateRefundAmount(
            Number(reservation.totalAmount),
            reservation.visitDate
        );

        // Update reservation status
        const updatedReservation = await this.reservationRepository.updateStatus(
            id,
            ReservationStatus.CANCELLED
        );

        // Release park schedule slots
        await this.updateParkSchedule(
            reservation.parkId,
            reservation.visitDate,
            -reservation.numberOfVisitors
        );

        return {
            reservation: updatedReservation,
            refundAmount,
        };
    }

    async confirmReservation(id: string): Promise<Reservation> {
        const reservation = await this.reservationRepository.findById(id);

        if (!reservation) {
            throw new AppError('Reservation not found', 404);
        }

        if (reservation.status !== ReservationStatus.PENDING) {
            throw new AppError('Only pending reservations can be confirmed', 400);
        }

        return this.reservationRepository.updateStatus(id, ReservationStatus.CONFIRMED);
    }

    private async calculatePrice(
        parkId: string,
        visitorType: VisitorType,
        numberOfVisitors: number
    ): Promise<number> {
        // Get pricing rule for the park and visitor type
        const pricingRule = await prisma.pricingRule.findFirst({
            where: {
                parkId,
                visitorType,
                effectiveFrom: { lte: new Date() },
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: new Date() } },
                ],
            },
        });

        if (!pricingRule) {
            // Fallback to park base price
            const park = await this.parkRepository.findById(parkId);
            return Number(park!.basePrice) * numberOfVisitors;
        }

        return Number(pricingRule.price) * numberOfVisitors;
    }

    private async updateParkSchedule(
        parkId: string,
        date: Date,
        slotsChange: number
    ): Promise<void> {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        // Try to find existing schedule
        const existingSchedule = await prisma.parkSchedule.findUnique({
            where: {
                parkId_date: {
                    parkId,
                    date: normalizedDate,
                },
            },
        });

        if (existingSchedule) {
            // Update existing schedule
            await prisma.parkSchedule.update({
                where: {
                    parkId_date: {
                        parkId,
                        date: normalizedDate,
                    },
                },
                data: {
                    bookedSlots: {
                        increment: slotsChange,
                    },
                },
            });
        } else {
            // Create new schedule
            const park = await this.parkRepository.findById(parkId);
            if (park) {
                await prisma.parkSchedule.create({
                    data: {
                        parkId,
                        date: normalizedDate,
                        availableSlots: park.capacity,
                        bookedSlots: Math.max(0, slotsChange),
                    },
                });
            }
        }
    }
}
