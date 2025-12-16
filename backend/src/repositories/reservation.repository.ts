import prisma from '../config/database';
import { Reservation, ReservationStatus, Prisma } from '@prisma/client';

export class ReservationRepository {
    async create(data: Prisma.ReservationCreateInput): Promise<Reservation> {
        return prisma.reservation.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                park: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        openingTime: true,
                        closingTime: true,
                    },
                },
            },
        });
    }

    async findById(id: string): Promise<Reservation | null> {
        return prisma.reservation.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
                park: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        province: true,
                        openingTime: true,
                        closingTime: true,
                        imageUrls: true,
                    },
                },
                payment: true,
                ticket: true,
            },
        });
    }

    async findByBookingReference(bookingReference: string): Promise<Reservation | null> {
        return prisma.reservation.findUnique({
            where: { bookingReference },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                park: true,
                payment: true,
                ticket: true,
            },
        });
    }

    async findByUserId(
        userId: string,
        filters?: {
            status?: ReservationStatus;
            upcoming?: boolean;
        }
    ): Promise<Reservation[]> {
        const where: Prisma.ReservationWhereInput = { userId };

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.upcoming) {
            where.visitDate = { gte: new Date() };
        }

        return prisma.reservation.findMany({
            where,
            include: {
                park: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        province: true,
                        imageUrls: true,
                    },
                },
                payment: true,
                ticket: true,
            },
            orderBy: {
                visitDate: 'desc',
            },
        });
    }

    async update(id: string, data: Prisma.ReservationUpdateInput): Promise<Reservation> {
        return prisma.reservation.update({
            where: { id },
            data,
            include: {
                user: true,
                park: true,
                payment: true,
                ticket: true,
            },
        });
    }

    async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
        return this.update(id, { status });
    }

    async count(filters?: {
        userId?: string;
        parkId?: string;
        status?: ReservationStatus;
    }): Promise<number> {
        const where: Prisma.ReservationWhereInput = {};

        if (filters?.userId) {
            where.userId = filters.userId;
        }

        if (filters?.parkId) {
            where.parkId = filters.parkId;
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        return prisma.reservation.count({ where });
    }

    async getRevenueByPark(parkId: string, startDate?: Date, endDate?: Date): Promise<number> {
        const where: Prisma.ReservationWhereInput = {
            parkId,
            status: ReservationStatus.CONFIRMED,
        };

        if (startDate || endDate) {
            where.visitDate = {};
            if (startDate) where.visitDate.gte = startDate;
            if (endDate) where.visitDate.lte = endDate;
        }

        const result = await prisma.reservation.aggregate({
            where,
            _sum: {
                totalAmount: true,
            },
        });

        return Number(result._sum.totalAmount) || 0;
    }
}
