import { ParkRepository } from '../repositories/park.repository';
import { AppError } from '../middleware/error.middleware';
import { Park, Animal, Province, ParkStatus, Prisma } from '@prisma/client';

export class ParkService {
    private parkRepository: ParkRepository;

    constructor() {
        this.parkRepository = new ParkRepository();
    }

    async getAllParks(filters?: {
        province?: Province;
        status?: ParkStatus;
        search?: string;
    }): Promise<any[]> {
        const parks = await this.parkRepository.findAll(filters);

        // Add average rating to each park
        const parksWithRatings = await Promise.all(
            parks.map(async (park) => {
                const avgRating = await this.parkRepository.getAverageRating(park.id);
                // @ts-ignore
                const reviewCount = park.reviews?.length || 0;

                return {
                    ...park,
                    averageRating: Math.round(avgRating * 10) / 10,
                    reviewCount,
                    reviews: undefined, // Remove full reviews from list view
                };
            })
        );

        return parksWithRatings;
    }

    async getParkById(id: string): Promise<any> {
        const park = await this.parkRepository.findById(id);

        if (!park) {
            throw new AppError('Park not found', 404);
        }

        const avgRating = await this.parkRepository.getAverageRating(id);

        return {
            ...park,
            averageRating: Math.round(avgRating * 10) / 10,
            // @ts-ignore
            reviewCount: park.reviews?.length || 0,
        };
    }

    async createPark(data: {
        name: string;
        description: string;
        location: string;
        province: Province;
        district: string;
        capacity: number;
        openingTime: string;
        closingTime: string;
        basePrice: number;
        imageUrls?: string[];
        amenities?: string[];
    }): Promise<Park> {
        const park = await this.parkRepository.create({
            name: data.name,
            description: data.description,
            location: data.location,
            province: data.province,
            district: data.district,
            capacity: data.capacity,
            openingTime: data.openingTime,
            closingTime: data.closingTime,
            basePrice: data.basePrice,
            imageUrls: data.imageUrls || [],
            amenities: data.amenities || [],
            status: ParkStatus.ACTIVE,
        });

        // Create initial schedules for next 30 days
        await this.createSchedulesForPark(park.id, 30);

        return park;
    }

    async updatePark(id: string, data: Partial<Park>): Promise<Park> {
        const existingPark = await this.parkRepository.findById(id);

        if (!existingPark) {
            throw new AppError('Park not found', 404);
        }

        return this.parkRepository.update(id, data);
    }

    async deletePark(id: string): Promise<void> {
        const existingPark = await this.parkRepository.findById(id);

        if (!existingPark) {
            throw new AppError('Park not found', 404);
        }

        await this.parkRepository.delete(id);
    }

    // Animal management
    async addAnimal(parkId: string, data: {
        name: string;
        species: string;
        description: string;
        count: number;
        imageUrl: string;
        endangered?: boolean;
    }): Promise<Animal> {
        const park = await this.parkRepository.findById(parkId);

        if (!park) {
            throw new AppError('Park not found', 404);
        }

        return this.parkRepository.addAnimal(parkId, data);
    }

    async updateAnimal(animalId: string, data: Partial<Animal>): Promise<Animal> {
        return this.parkRepository.updateAnimal(animalId, data);
    }

    async deleteAnimal(animalId: string): Promise<void> {
        await this.parkRepository.deleteAnimal(animalId);
    }

    async getAnimals(parkId: string): Promise<Animal[]> {
        return this.parkRepository.getAnimals(parkId);
    }

    // Availability
    async checkAvailability(parkId: string, date: Date): Promise<{
        available: boolean;
        availableSlots: number;
        bookedSlots: number;
        capacity: number;
    }> {
        const park = await this.parkRepository.findById(parkId);

        if (!park) {
            throw new AppError('Park not found', 404);
        }

        if (park.status !== ParkStatus.ACTIVE) {
            return {
                available: false,
                availableSlots: 0,
                bookedSlots: 0,
                capacity: park.capacity,
            };
        }

        return this.parkRepository.checkAvailability(parkId, date);
    }

    // Helper method to create schedules
    private async createSchedulesForPark(parkId: string, days: number): Promise<void> {
        const park = await this.parkRepository.findById(parkId);
        if (!park) return;

        const schedules: any = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            date.setHours(0, 0, 0, 0);

            schedules.push({
                parkId,
                date,
                availableSlots: park.capacity,
                bookedSlots: 0,
            });
        }

        // Use Prisma to create schedules (skip if already exists)
        for (const schedule of schedules) {
            try {
                await prisma.parkSchedule.create({
                    data: schedule,
                });
            } catch (error) {
                // Schedule might already exist, skip
            }
        }
    }
}

// Import prisma for schedule creation
import prisma from '../config/database';
