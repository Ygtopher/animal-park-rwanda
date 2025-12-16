import prisma from '../config/database';
import { User, UserRole } from '@prisma/client';

export class UserRepository {
    async create(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        role?: UserRole;
    }): Promise<User> {
        return prisma.user.create({
            data,
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
            include: {
                parkRanger: {
                    include: {
                        park: true,
                    },
                },
            },
        });
    }

    async findAll(skip: number = 0, take: number = 10): Promise<Omit<User, 'password'>[]> {
        return prisma.user.findMany({
            skip,
            take,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async count(): Promise<number> {
        return prisma.user.count();
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    }
}
