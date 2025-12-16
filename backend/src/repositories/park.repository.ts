import prisma from '../config/database';
import { Park, Animal, ParkStatus, Province, Prisma } from '@prisma/client';

export class ParkRepository {
    async create(data: Prisma.ParkCreateInput): Promise<Park> {
        return prisma.park.create({
            data,
            include: {
                animals: true,
                pricingRules: true,
            },
        });
    }

    async findAll(filters?: {
        province?: Province;
        status?: ParkStatus;
        search?: string;
    }): Promise<Park[]> {
        const where: Prisma.ParkWhereInput = {};

        if (filters?.province) {
            where.province = filters.province;
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { location: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return prisma.park.findMany({
            where,
            include: {
                animals: true,
                pricingRules: {
                    where: {
                        effectiveFrom: { lte: new Date() },
                        OR: [
                            { effectiveTo: null },
                            { effectiveTo: { gte: new Date() } },
                        ],
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    async findById(id: string): Promise<Park | null> {
        return prisma.park.findUnique({
            where: { id },
            include: {
                animals: true,
                pricingRules: {
                    where: {
                        effectiveFrom: { lte: new Date() },
                        OR: [
                            { effectiveTo: null },
                            { effectiveTo: { gte: new Date() } },
                        ],
                    },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                schedules: {
                    where: {
                        date: { gte: new Date() },
                    },
                    orderBy: {
                        date: 'asc',
                    },
                    take: 30,
                },
            },
        });
    }

    async update(id: string, data: Prisma.ParkUpdateInput): Promise<Park> {
        return prisma.park.update({
            where: { id },
            data,
            include: {
                animals: true,
                pricingRules: true,
            },
        });
    }

    async delete(id: string): Promise<Park> {
        return prisma.park.delete({
            where: { id },
        });
    }

    async count(filters?: { province?: Province; status?: ParkStatus }): Promise<number> {
        const where: Prisma.ParkWhereInput = {};

        if (filters?.province) {
            where.province = filters.province;
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        return prisma.park.count({ where });
    }

    // Animal management
    async addAnimal(parkId: string, data: Omit<Prisma.AnimalCreateInput, 'park'>): Promise<Animal> {
        return prisma.animal.create({
            data: {
                ...data,
                park: {
                    connect: { id: parkId },
                },
            },
        });
    }

    async updateAnimal(animalId: string, data: Prisma.AnimalUpdateInput): Promise<Animal> {
        return prisma.animal.update({
            where: { id: animalId },
            data,
        });
    }

    async deleteAnimal(animalId: string): Promise<Animal> {
        return prisma.animal.delete({
            where: { id: animalId },
        });
    }

    async getAnimals(parkId: string): Promise<Animal[]> {
        return prisma.animal.findMany({
            where: { parkId },
            orderBy: { name: 'asc' },
        });
    }

    // Availability checking
    async checkAvailability(parkId: string, date: Date): Promise<{
        available: boolean;
        availableSlots: number;
        bookedSlots: number;
        capacity: number;
    }> {
        const park = await prisma.park.findUnique({
            where: { id: parkId },
            select: { capacity: true },
        });

        if (!park) {
            throw new Error('Park not found');
        }

        const schedule = await prisma.parkSchedule.findUnique({
            where: {
                parkId_date: {
                    parkId,
                    date,
                },
            },
        });

        if (!schedule) {
            // No schedule exists, use park capacity
            return {
                available: true,
                availableSlots: park.capacity,
                bookedSlots: 0,
                capacity: park.capacity,
            };
        }

        const availableSlots = schedule.availableSlots - schedule.bookedSlots;

        return {
            available: availableSlots > 0,
            availableSlots,
            bookedSlots: schedule.bookedSlots,
            capacity: schedule.availableSlots,
        };
    }

    async getAverageRating(parkId: string): Promise<number> {
        const result = await prisma.review.aggregate({
            where: { parkId },
            _avg: {
                rating: true,
            },
        });

        return result._avg.rating || 0;
    }
}
