import prisma from '../config/database';
import { Payment, PaymentStatus, PaymentMethod } from '@prisma/client';

export class PaymentRepository {
    async create(data: {
        reservationId: string;
        amount: number;
        currency?: string;
        method: PaymentMethod;
        transactionId: string;
    }): Promise<Payment> {
        return prisma.payment.create({
            data: {
                reservation: { connect: { id: data.reservationId } },
                amount: data.amount,
                currency: data.currency || 'RWF',
                method: data.method,
                transactionId: data.transactionId,
                status: PaymentStatus.PENDING,
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
    }

    async findById(id: string): Promise<Payment | null> {
        return prisma.payment.findUnique({
            where: { id },
            include: {
                reservation: {
                    include: {
                        user: true,
                        park: true,
                    },
                },
            },
        });
    }

    async findByTransactionId(transactionId: string): Promise<Payment | null> {
        return prisma.payment.findUnique({
            where: { transactionId },
            include: {
                reservation: true,
            },
        });
    }

    async findByReservationId(reservationId: string): Promise<Payment | null> {
        return prisma.payment.findUnique({
            where: { reservationId },
        });
    }

    async updateStatus(
        id: string,
        status: PaymentStatus,
        paidAt?: Date
    ): Promise<Payment> {
        return prisma.payment.update({
            where: { id },
            data: {
                status,
                paidAt: paidAt || (status === PaymentStatus.COMPLETED ? new Date() : undefined),
            },
        });
    }
}
